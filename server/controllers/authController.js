import User from '../models/User.js';
import { sendToken } from '../utils/helpers.js';

export const register = async (req, res) => {
  const { name, password, phone, address } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email, password, phone, address });
  sendToken(user, 201, res);
};

export const login = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { password } = req.body;
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

export const addAddress = async (req, res) => {
  const { label, street, city, state, pincode, lat, lng, isDefault } = req.body;
  if (!street) return res.status(400).json({ success: false, message: 'Street address is required' });
  const user = await User.findById(req.user.id);
  if (isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }
  const addrData = { label: label || 'Home', street, city, state, pincode, isDefault: user.addresses.length === 0 ? true : !!isDefault };
  if (lat !== undefined) addrData.lat = lat;
  if (lng !== undefined) addrData.lng = lng;
  user.addresses.push(addrData);
  await user.save();
  res.json({ success: true, user });
};

export const editAddress = async (req, res) => {
  const { id } = req.params;
  const { label, street, city, state, pincode, lat, lng, isDefault } = req.body;
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(id);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
  if (isDefault) {
    user.addresses.forEach(a => a.isDefault = false);
  }
  if (label !== undefined) addr.label = label;
  if (street !== undefined) addr.street = street;
  if (city !== undefined) addr.city = city;
  if (state !== undefined) addr.state = state;
  if (pincode !== undefined) addr.pincode = pincode;
  if (lat !== undefined) addr.lat = lat;
  if (lng !== undefined) addr.lng = lng;
  if (isDefault !== undefined) addr.isDefault = isDefault;
  await user.save();
  res.json({ success: true, user });
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(id);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
  const wasDefault = addr.isDefault;
  user.addresses.pull(id);
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }
  await user.save();
  res.json({ success: true, user });
};
