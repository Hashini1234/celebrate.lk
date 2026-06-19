import Vendor from '../models/Vendor.js';

function dayBounds(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export async function listVendors(req, res) {
  const query = { active: true };
  if (req.query.serviceType) query.serviceType = req.query.serviceType;

  if (req.query.date) {
    const { start, end } = dayBounds(req.query.date);
    query.unavailableDates = { $not: { $elemMatch: { $gte: start, $lt: end } } };
  }

  const vendors = await Vendor.find(query).sort({ serviceType: 1, name: 1 });
  res.json(vendors);
}

export async function createVendor(req, res) {
  const vendor = await Vendor.create(req.body);
  res.status(201).json(vendor);
}

export async function updateVendor(req, res) {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json(vendor);
}

export async function deleteVendor(req, res) {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
  res.json({ message: 'Vendor disabled' });
}
