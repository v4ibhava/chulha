import Otp from '../models/Otp.js';
import User from '../models/User.js';
import { sendToken } from '../utils/helpers.js';
import { sendOtpEmail } from '../utils/email.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.deleteMany({ email, type: 'login' });
  await Otp.create({ email, otp, type: 'login', expiresAt });

  await sendOtpEmail(email, otp, 'login');

  res.json({ success: true, message: 'OTP sent to email' });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const record = await Otp.findOne({ email, otp, type: 'login', expiresAt: { $gt: new Date() } });
  if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  await Otp.deleteMany({ email, type: 'login' });

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name: email.split('@')[0] });
  }

  sendToken(user, 200, res);
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'No account with this email' });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.deleteMany({ email, type: 'password_reset' });
  await Otp.create({ email, otp, type: 'password_reset', expiresAt });

  await sendOtpEmail(email, otp, 'password_reset');

  res.json({ success: true, message: 'Reset OTP sent to email' });
};

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });

  const record = await Otp.findOne({ email, otp, type: 'password_reset', expiresAt: { $gt: new Date() } });
  if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  await Otp.deleteMany({ email, type: 'password_reset' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.password = password;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully' });
};
