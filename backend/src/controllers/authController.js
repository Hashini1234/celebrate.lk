import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function sendAuth(res, user) {
  res.json({ user: user.toSafeObject ? user.toSafeObject() : user, token: signToken(user) });
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, phone, password, role: 'customer' });
  sendAuth(res, user);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  sendAuth(res, user);
}

export async function me(req, res) {
  res.json({ user: req.user });
}
