import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      enum: ['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'],
      required: true
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    pricePerEvent: { type: Number, default: 0, min: 0 },
    unavailableDates: [{ type: Date }],
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Vendor', vendorSchema);
