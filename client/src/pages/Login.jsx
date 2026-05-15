import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('password');
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!form.email) return toast.error('Enter your email first');
    setLoading(true);
    try {
      await sendOtp(form.email);
      toast.success('OTP sent to your email');
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otpSent) return handleSendOtp();
    setLoading(true);
    try {
      await verifyOtp(form.email, form.otp);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-8 animate-fade-in">
        <div className="text-center mb-8">
          <img src="/images/chulha-logo.png" alt="Chulha" className="h-12 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal-900">Welcome Back</h2>
          <p className="text-charcoal-500 text-sm">Sign in to your account</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('password'); setOtpSent(false); setForm({ ...form, otp: '' }); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'password' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500 hover:text-charcoal-700'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setMode('otp'); setForm({ ...form, password: '' }); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'otp' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500 hover:text-charcoal-700'}`}
          >
            OTP Login
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" required />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 font-bold">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
        ) : (
          <form onSubmit={handleOtpLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required disabled={otpSent} />
            </div>
            {otpSent && (
              <div>
                <label className="block text-sm font-bold text-charcoal-700 mb-1">OTP</label>
                <input
                  type="text"
                  value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="input-field text-center text-2xl tracking-[0.5em] font-black"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-[10px] text-charcoal-500 mt-1.5 text-center">Enter the 6-digit code sent to your email</p>
              </div>
            )}
            {!otpSent ? (
              <button type="button" onClick={handleSendOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
            ) : (
              <div className="space-y-2">
                <button type="submit" disabled={loading || form.otp.length !== 6} className="btn-primary w-full">{loading ? 'Verifying...' : 'Verify & Login'}</button>
                <button type="button" onClick={() => { setOtpSent(false); setForm({ ...form, otp: '' }); }} className="w-full text-xs text-charcoal-500 hover:text-primary-500 font-bold transition-colors">Change email or resend</button>
              </div>
            )}
          </form>
        )}

        <p className="text-center text-sm text-charcoal-500 mt-6">
          Don't have an account? <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold">Register</Link>
        </p>
      </div>
    </div>
  );
}
