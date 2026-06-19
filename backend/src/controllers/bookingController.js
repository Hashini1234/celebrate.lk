import Booking from '../models/Booking.js';
import EventService from '../models/EventService.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import { sendEmail } from '../utils/email.js';

function populateBooking(query) {
  return query
    .populate('customer', 'name email phone')
    .populate('eventService')
    .populate('assignedVendors');
}

export async function createBooking(req, res) {
  const { eventService, eventDate, startTime, endTime, guestCount, venueAddress, notes, paymentAmount, paymentType, paymentNote } = req.body;
  const service = await EventService.findById(eventService);
  if (!service) return res.status(404).json({ message: 'Event service not found' });
  if (!startTime || !endTime) return res.status(400).json({ message: 'Start time and end time are required' });

  const booking = await Booking.create({
    customer: req.user._id,
    eventService,
    eventDate,
    startTime,
    endTime,
    guestCount,
    venueAddress,
    notes,
    estimatedTotal: service.basePrice
  });

  if (req.file && paymentAmount && paymentType) {
    booking.payments.push({
      amount: Number(paymentAmount),
      type: paymentType,
      note: paymentNote,
      slipUrl: `/uploads/${req.file.filename}`
    });
    await booking.save();
  }

  const admins = await User.find({ role: 'admin' });
  await Promise.all(
    admins.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: 'New event booking request',
        html: `<p>${req.user.name} requested ${service.title} on ${new Date(eventDate).toDateString()} from ${startTime} to ${endTime}.</p>${req.file ? '<p>A payment slip was uploaded with this booking.</p>' : ''}`
      })
    )
  );

  res.status(201).json(await populateBooking(Booking.findById(booking._id)));
}

export async function myBookings(req, res) {
  const bookings = await populateBooking(Booking.find({ customer: req.user._id }).sort({ createdAt: -1 }));
  res.json(bookings);
}

export async function listBookings(_req, res) {
  const bookings = await populateBooking(Booking.find().sort({ createdAt: -1 }));
  res.json(bookings);
}

export async function assignVendors(req, res) {
  const { vendorIds, estimatedTotal, adminMessage } = req.body;
  const booking = await Booking.findById(req.params.id).populate('eventService').populate('customer', 'name email');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  const vendors = await Vendor.find({ _id: { $in: vendorIds }, active: true });
  booking.assignedVendors = vendors.map((vendor) => vendor._id);
  booking.estimatedTotal = estimatedTotal ?? booking.estimatedTotal;
  booking.adminMessage = adminMessage;
  booking.status = 'vendor_assigned';
  await booking.save();

  res.json(await populateBooking(Booking.findById(booking._id)));
}

export async function updateBookingStatus(req, res) {
  const { status, adminMessage } = req.body;
  const booking = await Booking.findById(req.params.id)
    .populate('eventService')
    .populate('customer', 'name email');

  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  booking.status = status;
  booking.adminMessage = adminMessage ?? booking.adminMessage;
  await booking.save();

  if (status === 'approved') {
    await sendEmail({
      to: booking.customer.email,
      subject: 'Your event booking was approved',
      html: `<p>Hello ${booking.customer.name}, your ${booking.eventService.title} booking is approved.</p><p>You can now upload a half or full payment slip from your dashboard.</p>`
    });
  }

  res.json(await populateBooking(Booking.findById(booking._id)));
}

export async function verifyPayment(req, res) {
  const booking = await Booking.findById(req.params.id)
    .populate('eventService')
    .populate('customer', 'name email');

  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!booking.payments.length) return res.status(400).json({ message: 'No payment slip found for this booking' });

  booking.payments.forEach((payment) => {
    payment.status = 'verified';
  });
  booking.status = 'completed';
  booking.adminMessage = 'Payment verified. Your event is confirmed.';
  await booking.save();

  await sendEmail({
    to: booking.customer.email,
    subject: 'Your event payment was verified',
    html: `<p>Hello ${booking.customer.name}, your payment for ${booking.eventService.title} was verified. Your event is confirmed.</p>`
  });

  res.json(await populateBooking(Booking.findById(booking._id)));
}

export async function uploadPayment(req, res) {
  const { amount, type, note } = req.body;
  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (!req.file) return res.status(400).json({ message: 'Payment slip image is required' });

  booking.payments.push({
    amount: Number(amount),
    type,
    note,
    slipUrl: `/uploads/${req.file.filename}`
  });
  await booking.save();

  const admins = await User.find({ role: 'admin' });
  await Promise.all(
    admins.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: 'New payment slip uploaded',
        html: `<p>A customer uploaded a ${type} payment slip for booking ${booking._id}.</p>`
      })
    )
  );

  res.status(201).json(await populateBooking(Booking.findById(booking._id)));
}
