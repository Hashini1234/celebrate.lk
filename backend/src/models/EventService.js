import mongoose from 'mongoose';

const eventServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Wedding', 'Birthday', 'Engagement', 'Corporate', 'Festival', 'Meeting', 'Other'],
      required: true
    },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    coverImage: { type: String, required: true },
    inclusions: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model('EventService', eventServiceSchema);
