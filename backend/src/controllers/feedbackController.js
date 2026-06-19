import Booking from '../models/Booking.js';
import Feedback from '../models/Feedback.js';

export async function listFeedback(_req, res) {
  const feedback = await Feedback.find({ visible: true })
    .populate('customer', 'name')
    .populate({ path: 'booking', populate: { path: 'eventService', select: 'title category' } })
    .sort({ createdAt: -1 });
  res.json(feedback);
}

export async function createFeedback(req, res) {
  const { bookingId, rating, comment } = req.body;
  const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  const feedback = await Feedback.create({
    customer: req.user._id,
    booking: bookingId,
    rating,
    comment
  });

  res.status(201).json(await feedback.populate('customer', 'name'));
}
