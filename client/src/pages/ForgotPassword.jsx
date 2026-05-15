import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Reset OTP sent to your email');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword(email, otp, password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-8 animate-fade-in">
        <div className="text-center mb-8">
          <img src="/images/chulha-logo.png" alt="Chulha" className="h-12 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal-900">
            {step === 'email' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="text-charcoal-500 text-sm">
            {step === 'email' ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Code'}</button>
            <p className="text-center text-xs text-charcoal-500 mt-2">
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">Back to Login</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-[0.5em] font-black"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="At least 6 characters" minLength={6} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-field" placeholder="Repeat your password" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
            <div className="flex justify-between text-xs mt-2">
              <button type="button" onClick={() => setStep('email')} className="text-charcoal-500 hover:text-primary-500 font-bold transition-colors">Change email</button>
              <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
