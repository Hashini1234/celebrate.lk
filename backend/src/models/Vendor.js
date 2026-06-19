import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorApplication' },
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, trim: true },
    serviceType: {
      type: String,
      enum: ['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'],
      required: true
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    yearsOfExperience: { type: Number, default: 0, min: 0 },
    portfolioImages: [{ type: String }],
    businessRegistrationUrl: { type: String },
    verified: { type: Boolean, default: true },
    pricePerEvent: { type: Number, default: 0, min: 0 },
    unavailableDates: [{ type: Date }],
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Vendor', vendorSchema);
