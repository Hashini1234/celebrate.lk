import mongoose from 'mongoose';

const vendorApplicationSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    vendorCategory: {
      type: String,
      enum: ['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'],
      required: true
    },
    yearsOfExperience: { type: Number, default: 0, min: 0 },
    description: { type: String, required: true, trim: true },
    portfolioImages: [{ type: String }],
    businessRegistrationUrl: { type: String },
    password: { type: String, required: true, minlength: 6 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, trim: true },
    reviewedAt: { type: Date },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }
  },
  { timestamps: true }
);

export default mongoose.model('VendorApplication', vendorApplicationSchema);
