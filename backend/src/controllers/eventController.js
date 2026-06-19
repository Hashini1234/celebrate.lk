import EventService from '../models/EventService.js';

export async function listEvents(_req, res) {
  const events = await EventService.find().sort({ createdAt: -1 });
  res.json(events);
}

export async function createEvent(req, res) {
  const event = await EventService.create(req.body);
  res.status(201).json(event);
}

export async function updateEvent(req, res) {
  const event = await EventService.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ message: 'Event service not found' });
  res.json(event);
}

export async function deleteEvent(req, res) {
  const event = await EventService.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event service not found' });
  res.json({ message: 'Event service deleted' });
}
