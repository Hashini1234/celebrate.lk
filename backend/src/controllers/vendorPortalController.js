import Booking from '../models/Booking.js';
import Vendor from '../models/Vendor.js';
import VendorService from '../models/VendorService.js';

async function getMyVendor(userId) {
  return Vendor.findOne({ owner: userId, active: true });
}

export async function vendorDashboard(req, res) {
  const vendor = await getMyVendor(req.user._id);
  if (!vendor) return res.status(404).json({ message: 'Approved vendor profile not found' });

  const bookings = await Booking.find({ assignedVendors: vendor._id }).populate('customer', 'name email phone').populate('eventService');
  const services = await VendorService.find({ vendor: vendor._id, active: true });
  const totalEarnings = bookings
    .filter((booking) => booking.status === 'completed')
    .reduce((sum, booking) => sum + Number(booking.estimatedTotal || 0), 0);

  res.json({
    vendor,
    stats: {
      totalRequests: bookings.length,
      acceptedBookings: bookings.filter((booking) => booking.status !== 'rejected').length,
      upcomingEvents: bookings.filter((booking) => ['approved', 'vendor_assigned'].includes(booking.status)).length,
      totalEarnings
    },
    bookings,
    services
  });
}

export async function createVendorService(req, res) {
  const vendor = await getMyVendor(req.user._id);
  if (!vendor) return res.status(404).json({ message: 'Approved vendor profile not found' });

  const service = await VendorService.create({
    vendor: vendor._id,
    ...req.body,
    price: Number(req.body.price)
  });
  res.status(201).json(service);
}

export async function updateVendorService(req, res) {
  const vendor = await getMyVendor(req.user._id);
  const service = await VendorService.findOneAndUpdate(
    { _id: req.params.id, vendor: vendor?._id },
    { ...req.body, price: req.body.price === undefined ? undefined : Number(req.body.price) },
    { new: true }
  );
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
}

export async function deleteVendorService(req, res) {
  const vendor = await getMyVendor(req.user._id);
  const service = await VendorService.findOneAndUpdate({ _id: req.params.id, vendor: vendor?._id }, { active: false }, { new: true });
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json({ message: 'Service deleted' });
}

export async function updateVendorBookingResponse(req, res) {
  const vendor = await getMyVendor(req.user._id);
  if (!vendor) return res.status(404).json({ message: 'Approved vendor profile not found' });

  const booking = await Booking.findOne({ _id: req.params.id, assignedVendors: vendor._id });
  if (!booking) return res.status(404).json({ message: 'Booking request not found' });

  const { action } = req.body;
  if (action === 'accept') {
    booking.status = booking.status === 'pending' ? 'vendor_assigned' : booking.status;
  }
  if (action === 'reject') {
    booking.assignedVendors = booking.assignedVendors.filter((id) => id.toString() !== vendor._id.toString());
  }
  await booking.save();
  res.json(await booking.populate('customer', 'name email phone'));
}

export async function uploadVendorPortfolio(req, res) {
  const vendor = await getMyVendor(req.user._id);
  if (!vendor) return res.status(404).json({ message: 'Approved vendor profile not found' });

  const images = (req.files || []).map((file) => `/uploads/${file.filename}`);
  vendor.portfolioImages.push(...images);
  await vendor.save();
  res.status(201).json(vendor);
}
