import mongoose from 'mongoose';

const vendorServiceSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Venue', 'Catering', 'Photography', 'Decorations', 'Music', 'Transport', 'Other'],
      required: true
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    coverImage: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('VendorService', vendorServiceSchema);
