import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['half', 'full'], required: true },
    slipUrl: { type: String, required: true },
    note: { type: String, trim: true },
    status: { type: String, enum: ['submitted', 'verified', 'rejected'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventService: { type: mongoose.Schema.Types.ObjectId, ref: 'EventService', required: true },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    guestCount: { type: Number, required: true, min: 1 },
    venueAddress: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'vendor_assigned', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    estimatedTotal: { type: Number, default: 0, min: 0 },
    payments: [paymentSchema],
    adminMessage: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
