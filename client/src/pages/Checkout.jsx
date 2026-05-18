import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import GoogleMapPicker from '../components/GoogleMapPicker';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shippingAddress: user?.address || '', phone: user?.phone || '', paymentMethod: 'cod' });
  const [submitting, setSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

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

  const handleMapLocationSelect = (loc) => {
    const formatted = [
      loc.street,
      loc.city,
      loc.state ? `${loc.state}${loc.pincode ? ' ' + loc.pincode : ''}` : loc.pincode
    ].filter(Boolean).join(', ');
    
    setForm(prev => ({
      ...prev,
      shippingAddress: formatted
    }));
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
            
            {/* Quick Select Saved Addresses */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-charcoal-400 uppercase tracking-wider">Select Saved Address</label>
                <div className="grid grid-cols-1 gap-2">
                  {user.addresses.map(addr => {
                    const fullAddrString = [
                      addr.street,
                      addr.city,
                      addr.state ? `${addr.state}${addr.pincode ? ' ' + addr.pincode : ''}` : addr.pincode
                    ].filter(Boolean).join(', ');
                    
                    const isSelected = form.shippingAddress === fullAddrString;
                    
                    return (
                      <button
                        key={addr._id}
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, shippingAddress: fullAddrString }));
                          toast.success(`Delivery address set to: ${addr.label}`);
                        }}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-red-50/30 ring-1 ring-primary-500'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className="text-xs font-bold text-charcoal-950">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] font-bold text-primary-600 bg-red-100 px-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600 truncate w-full">{addr.street}</p>
                        {addr.city && (
                          <p className="text-[10px] text-charcoal-400">
                            {addr.city}{addr.state ? `, ${addr.state}` : ''}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery Address Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-charcoal-700">Delivery Address</label>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  <MapPinIcon className="w-3.5 h-3.5" />
                  Pin on Map
                </button>
              </div>
              <textarea
                value={form.shippingAddress}
                onChange={e => setForm({ ...form, shippingAddress: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Enter street, room number, landmark, etc. or pin location on map"
                required
              />
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+91 9999999999"
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-bold text-charcoal-700 mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                className="input-field"
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card">Card Payment</option>
              </select>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Placing Order...' : `Place Order - ₹${totalPrice}`}
            </button>
          </div>
        </form>

        {/* Order Summary Column */}
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

      {/* Visual Map Selector Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowMapModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-charcoal-900">Pin Delivery Location</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-charcoal-400 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-[320px] mb-4">
              <GoogleMapPicker
                onLocationSelect={handleMapLocationSelect}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="flex-1 bg-primary-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-95 transition-all text-sm text-center"
              >
                Confirm Pin Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

