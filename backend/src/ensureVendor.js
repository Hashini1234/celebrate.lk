import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Vendor from './models/Vendor.js';
import VendorService from './models/VendorService.js';

await connectDB();

let vendorUser = await User.findOne({ email: 'vendor@celebrate.lk' });
if (!vendorUser) {
  vendorUser = await User.create({
    name: 'Frame Story Studio',
    email: 'vendor@celebrate.lk',
    phone: '0773333333',
    password: 'vendor123',
    role: 'vendor'
  });
} else {
  vendorUser.role = 'vendor';
  vendorUser.name = vendorUser.name || 'Frame Story Studio';
  await vendorUser.save();
}

let vendor = await Vendor.findOne({ owner: vendorUser._id });
if (!vendor) {
  vendor = await Vendor.create({
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
    verified: true,
    active: true
  });
}

const serviceExists = await VendorService.findOne({ vendor: vendor._id, title: 'Premium Wedding Photography' });
if (!serviceExists) {
  await VendorService.create({
    vendor: vendor._id,
    title: 'Premium Wedding Photography',
    category: 'Photography',
    description: 'Full-day photography coverage with edited album and online gallery.',
    price: 100000,
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'
  });
}

console.log('Vendor login ready: vendor@celebrate.lk / vendor123');
await mongoose.disconnect();
