import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
