import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/axios';

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shippingAddress: user?.address || '', phone: user?.phone || '', paymentMethod: 'cod' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shippingAddress || !form.phone) return toast.error('Please fill all fields');
    if (items.length === 0) return toast.error('Cart is empty');
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ foodId: i._id, quantity: i.qty })),
        shippingAddress: form.shippingAddress,
        phone: form.phone,
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-charcoal-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Delivery Address</label>
              <textarea value={form.shippingAddress} onChange={e => setForm({ ...form, shippingAddress: e.target.value })} className="input-field" rows={3} required />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="input-field">
                <option value="cod">Cash on Delivery</option>
                <option value="card">Card Payment</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Placing Order...' : `Place Order - ₹${totalPrice}`}
            </button>
          </div>
        </form>
        <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 h-fit">
          <h3 className="font-bold text-lg text-charcoal-900 mb-4">Order Summary</h3>
          {items.map(item => (
            <div key={item._id} className="flex justify-between py-2 text-sm border-b border-neutral-100">
              <span className="text-charcoal-700">{item.name} × {item.qty}</span>
              <span className="font-bold text-charcoal-900">₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 text-lg font-black">
            <span className="text-charcoal-900">Total</span>
            <span className="text-primary-500">₹{totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
