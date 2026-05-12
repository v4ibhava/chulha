import User from '../models/User.js';
import { sendToken } from '../utils/helpers.js';

export const register = async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email, password, phone, address });
  sendToken(user, 201, res);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  sendToken(user, 200, res);
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

export const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone, address }, { new: true, runValidators: true });
  res.json({ success: true, user });
};
