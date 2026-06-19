import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import VendorApplication from '../models/VendorApplication.js';
import { sendEmail } from '../utils/email.js';

function fileUrl(file) {
  return file ? `/uploads/${file.filename}` : undefined;
}

export async function applyVendor(req, res) {
  const {
    businessName,
    ownerName,
    email,
    phone,
    district,
    vendorCategory,
    yearsOfExperience,
    description,
    password
  } = req.body;

  const existingUser = await User.findOne({ email });
  const existingPending = await VendorApplication.findOne({ email, status: 'pending' });
  if (existingUser || existingPending) {
    return res.status(409).json({ message: 'This email already has an account or pending application' });
  }

  const portfolioImages = (req.files?.portfolioImages || []).map(fileUrl);
  const businessRegistrationUrl = fileUrl(req.files?.businessRegistration?.[0]);

  const application = await VendorApplication.create({
    businessName,
    ownerName,
    email,
    phone,
    district,
    vendorCategory,
    yearsOfExperience,
    description,
    password,
    portfolioImages,
    businessRegistrationUrl
  });

  const admins = await User.find({ role: 'admin' });
  await Promise.all(
    admins.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: 'New Celebrate.lk vendor partner application',
        html: `<p>${businessName} applied to join the Celebrate.lk Partner Network.</p>`
      })
    )
  );

  res.status(201).json({ message: 'Application submitted for review', application });
}

export async function listVendorApplications(_req, res) {
  const applications = await VendorApplication.find().populate('vendor').sort({ createdAt: -1 });
  res.json(applications);
}

export async function updateVendorApplicationStatus(req, res) {
  const { status, adminNote } = req.body;
  const application = await VendorApplication.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  application.status = status;
  application.adminNote = adminNote;
  application.reviewedAt = new Date();

  if (status === 'approved' && !application.vendor) {
    let user = await User.findOne({ email: application.email });
    if (!user) {
      user = await User.create({
        name: application.ownerName,
        email: application.email,
        phone: application.phone,
        password: application.password,
        role: 'vendor'
      });
    }

    const vendor = await Vendor.create({
      owner: user._id,
      application: application._id,
      name: application.businessName,
      ownerName: application.ownerName,
      serviceType: application.vendorCategory,
      email: application.email,
      phone: application.phone,
      location: application.district,
      yearsOfExperience: application.yearsOfExperience,
      description: application.description,
      portfolioImages: application.portfolioImages,
      businessRegistrationUrl: application.businessRegistrationUrl,
      verified: true,
      active: true
    });

    application.vendor = vendor._id;
  }

  await application.save();

  await sendEmail({
    to: application.email,
    subject: `Celebrate.lk partner application ${status}`,
    html:
      status === 'approved'
        ? '<p>Your Celebrate.lk Partner Vendor application was approved. You can now login as a vendor.</p>'
        : '<p>Your Celebrate.lk Partner Vendor application was rejected. Please contact admin for more details.</p>'
  });

  res.json(await application.populate('vendor'));
}
