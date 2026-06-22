import crypto from 'crypto';
import Booking from '../models/Booking.js';
import EventService from '../models/EventService.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

function md5(value) {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function resolvePaymentAmount({ paymentAmount, paymentType, packageAmount }) {
  const total = Number(packageAmount);
  const requestedAmount = Number(paymentAmount);
  const maxPaymentAmount = Number(process.env.PAYHERE_MAX_PAYMENT_AMOUNT || 50000);

  if (Number.isFinite(requestedAmount) && requestedAmount > 0) {
    if (requestedAmount > total) {
      return { error: 'Payment amount cannot exceed the package total.' };
    }

    const amount = Math.min(requestedAmount, maxPaymentAmount);

    return {
      amount,
      type: amount >= total ? 'full' : 'half',
      label: amount >= total ? 'Full Payment' : amount >= total / 2 ? 'Half Payment' : 'Advance Payment'
    };
  }

  const preferredAmount = paymentType === 'full' ? total : total / 2;
  const amount = Math.min(preferredAmount, maxPaymentAmount);
  return {
    amount,
    type: amount >= total ? 'full' : 'half',
    label: amount >= total ? 'Full Payment' : amount >= total / 2 ? 'Half Payment' : 'Advance Payment'
  };
}

function getPayHereConfig() {
  const sandbox = process.env.PAYHERE_SANDBOX !== 'false';
  return {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
    currency: process.env.PAYHERE_CURRENCY || 'LKR',
    sandbox,
    notifyUrl: process.env.PAYHERE_NOTIFY_URL,
    returnUrl: process.env.PAYHERE_RETURN_URL || process.env.CLIENT_URL,
    cancelUrl: process.env.PAYHERE_CANCEL_URL || process.env.CLIENT_URL
  };
}

function isLocalUrl(url = '') {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\b/i.test(url);
}

function createCheckoutHash({ merchantId, orderId, amount, currency, merchantSecret }) {
  return md5(`${merchantId}${orderId}${formatAmount(amount)}${currency}${md5(merchantSecret)}`);
}

function createNotificationHash({ merchantId, orderId, amount, currency, statusCode, merchantSecret }) {
  return md5(`${merchantId}${orderId}${amount}${currency}${statusCode}${md5(merchantSecret)}`);
}

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Customer',
    lastName: parts.slice(1).join(' ') || 'Celebrate'
  };
}

function getPublicBooking(bookingId) {
  return Booking.findById(bookingId)
    .populate('customer', 'name email phone')
    .populate('eventService')
    .populate('assignedVendors');
}

export async function createPayHerePayment(req, res) {
  const config = getPayHereConfig();
  if (!config.merchantId || !config.merchantSecret || !config.notifyUrl) {
    return res.status(500).json({
      message: 'PayHere is not configured. Add PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET and PAYHERE_NOTIFY_URL to backend/.env.'
    });
  }
  if (!config.sandbox && isLocalUrl(config.notifyUrl)) {
    return res.status(500).json({
      message: 'PayHere live payments need a public HTTPS PAYHERE_NOTIFY_URL. Localhost callbacks cannot verify real payments.'
    });
  }

  const { eventService, eventDate, startTime, endTime, guestCount, venueAddress, notes, paymentAmount, paymentType } = req.body;
  const service = await EventService.findById(eventService);
  if (!service) return res.status(404).json({ message: 'Event service not found' });
  if (!eventDate || !startTime || !endTime || !guestCount || !venueAddress) {
    return res.status(400).json({ message: 'Please complete all booking details before payment.' });
  }

  const orderId = `CLK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const resolvedPayment = resolvePaymentAmount({ paymentAmount, paymentType, packageAmount: service.basePrice });
  if (resolvedPayment.error) return res.status(400).json({ message: resolvedPayment.error });
  const amount = resolvedPayment.amount;

  const booking = await Booking.create({
    customer: req.user._id,
    eventService,
    eventDate,
    startTime,
    endTime,
    guestCount,
    venueAddress,
    notes,
    estimatedTotal: service.basePrice,
    paymentGateway: 'payhere',
    paymentStatus: 'pending',
    paymentOrderId: orderId,
    adminMessage: `${resolvedPayment.label} started through PayHere. Booking will be confirmed after PayHere verification.`
  });

  const { firstName, lastName } = splitName(req.user.name);
  const payment = {
    sandbox: config.sandbox,
    merchant_id: config.merchantId,
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    notify_url: config.notifyUrl,
    order_id: orderId,
    items: `${service.title} - ${resolvedPayment.label}`,
    amount: formatAmount(amount),
    currency: config.currency,
    hash: createCheckoutHash({
      merchantId: config.merchantId,
      orderId,
      amount,
      currency: config.currency,
      merchantSecret: config.merchantSecret
    }),
    first_name: firstName,
    last_name: lastName,
    email: req.user.email,
    phone: req.user.phone || '0770000000',
    address: venueAddress,
    city: 'Colombo',
    country: 'Sri Lanka',
    custom_1: booking._id.toString(),
    custom_2: resolvedPayment.type
  };

  res.status(201).json({
    booking: await getPublicBooking(booking._id),
    payment
  });
}

export async function handlePayHereNotification(req, res) {
  const config = getPayHereConfig();
  const {
    merchant_id: merchantId,
    order_id: orderId,
    payment_id: paymentId,
    payhere_amount: payhereAmount,
    payhere_currency: payhereCurrency,
    status_code: statusCode,
    md5sig,
    method,
    status_message: statusMessage
  } = req.body;

  if (!config.merchantSecret || merchantId !== config.merchantId) {
    return res.status(400).send('Invalid merchant');
  }

  const localSignature = createNotificationHash({
    merchantId,
    orderId,
    amount: payhereAmount,
    currency: payhereCurrency,
    statusCode,
    merchantSecret: config.merchantSecret
  });

  if (localSignature !== md5sig) {
    return res.status(400).send('Invalid signature');
  }

  const booking = await Booking.findOne({ paymentOrderId: orderId })
    .populate('customer', 'name email')
    .populate('eventService');
  if (!booking) return res.status(404).send('Booking not found');

  booking.paymentId = paymentId;

  if (statusCode === '2') {
    const paidAmount = Number(payhereAmount);
    const paymentType = paidAmount >= Number(booking.estimatedTotal) ? 'full' : 'half';
    booking.paymentStatus = 'paid';
    booking.status = 'completed';
    booking.paidAt = new Date();
    booking.adminMessage = `PayHere payment verified${method ? ` via ${method}` : ''}. Your event is confirmed.`;

    const hasGatewayPayment = booking.payments.some((payment) => payment.note === `PayHere Order ${orderId}`);
    if (!hasGatewayPayment) {
      booking.payments.push({
        amount: paidAmount,
        type: paymentType,
        note: `PayHere Order ${orderId}`,
        status: 'verified'
      });
    }

    await booking.save();

    await sendEmail({
      to: booking.customer.email,
      subject: 'Your Celebrate.lk booking is confirmed',
      html: `<p>Hello ${booking.customer.name}, your payment for ${booking.eventService.title} was verified by PayHere.</p><p>Payment ID: ${paymentId}</p><p>Your event booking is now confirmed.</p>`
    });

    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        sendEmail({
          to: admin.email,
          subject: 'New PayHere payment received',
          html: `<p>Booking ${booking._id} was paid successfully.</p><p>Amount: ${payhereCurrency} ${payhereAmount}</p><p>Payment ID: ${paymentId}</p>`
        })
      )
    );
  } else {
    booking.paymentStatus = statusCode === '0' ? 'pending' : statusCode === '-1' ? 'cancelled' : 'failed';
    booking.adminMessage = statusMessage || 'PayHere payment was not completed.';
    await booking.save();
  }

  res.send('OK');
}
