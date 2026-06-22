import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Booking from './models/Booking.js';
import EventService from './models/EventService.js';
import Feedback from './models/Feedback.js';
import User from './models/User.js';
import Vendor from './models/Vendor.js';
import VendorService from './models/VendorService.js';

await connectDB();
await Promise.all([Booking.deleteMany(), Feedback.deleteMany(), EventService.deleteMany(), User.deleteMany(), Vendor.deleteMany(), VendorService.deleteMany()]);

const admin = await User.create({
  name: 'Admin User',
  email: 'admin@everlorg.com',
  phone: '0771234567',
  password: 'admin123',
  role: 'admin'
});

const customer = await User.create({
  name: 'Sample Customer',
  email: 'customer@everlorg.com',
  phone: '0712345678',
  password: 'customer123',
  role: 'customer'
});

const vendorUser = await User.create({
  name: 'Frame Story Studio',
  email: 'vendor@celebrate.lk',
  phone: '0773333333',
  password: 'vendor123',
  role: 'vendor'
});

const events = await EventService.insertMany([
  {
    title: 'Elegant Wedding Package',
    category: 'Wedding',
    description: 'Premium decor, vendor coordination, photography planning and full-day event support.',
    basePrice: 350000,
    coverImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    inclusions: ['Planning consultation', 'Decor coordination', 'Vendor shortlist', 'Timeline management']
  },
  {
    title: 'Birthday Celebration',
    category: 'Birthday',
    description: 'A colorful birthday setup with catering, entertainment and photo moments.',
    basePrice: 95000,
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    inclusions: ['Theme design', 'Cake table', 'Entertainment vendor', 'Guest flow']
  },
  {
    title: 'Corporate Evening',
    category: 'Corporate',
    description: 'Professional event planning for launches, annual gatherings and client evenings.',
    basePrice: 220000,
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    inclusions: ['Venue shortlist', 'AV vendor', 'Catering plan', 'Check-in support']
  }
]);

const vendors = await Vendor.insertMany([
  { name: 'Pearl Grand Hall', serviceType: 'Venue', email: 'venue@example.com', phone: '0771111111', location: 'Colombo', pricePerEvent: 180000 },
  { name: 'Royal Taste Catering', serviceType: 'Catering', email: 'catering@example.com', phone: '0772222222', location: 'Kandy', pricePerEvent: 90000 },
  {
    owner: vendorUser._id,
    name: 'Frame Story Studio',
    ownerName: 'Nuwan Perera',
    serviceType: 'Photography',
    email: 'vendor@celebrate.lk',
    phone: '0773333333',
    location: 'Galle',
    pricePerEvent: 75000,
    description: 'Wedding, birthday and corporate event photography partner.',
    yearsOfExperience: 6,
    portfolioImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80'
    ],
    verified: true
  },
  { name: 'Bloom Aura Decor', serviceType: 'Decorations', email: 'decor@example.com', phone: '0774444444', location: 'Colombo', pricePerEvent: 120000 },
  { name: 'Pulse DJ Crew', serviceType: 'Music', email: 'music@example.com', phone: '0775555555', location: 'Negombo', pricePerEvent: 50000 }
]);

await VendorService.create({
  vendor: vendors[2]._id,
  title: 'Premium Wedding Photography',
  category: 'Photography',
  description: 'Full-day photography coverage with edited album and online gallery.',
  price: 100000,
  coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'
});

const booking = await Booking.create({
  customer: customer._id,
  eventService: events[0]._id,
  eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  startTime: '16:00',
  endTime: '22:00',
  guestCount: 180,
  venueAddress: 'Colombo 07',
  notes: 'Outdoor evening wedding preferred.',
  status: 'completed',
  paymentStatus: 'paid',
  paymentGateway: 'manual',
  paidAt: new Date(),
  assignedVendors: [vendors[2]._id],
  estimatedTotal: 520000
});

await Feedback.create({
  customer: customer._id,
  booking: booking._id,
  rating: 5,
  comment: 'Beautiful planning experience. Vendor coordination was smooth and the event looked amazing.'
});

console.log('Seed complete');
console.log('Admin:', admin.email, 'admin123');
console.log('Customer:', customer.email, 'customer123');
console.log('Vendor:', vendorUser.email, 'vendor123');
await mongoose.disconnect();
