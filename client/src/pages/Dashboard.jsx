import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import GoogleMapPicker from '../components/GoogleMapPicker';

export default function Dashboard() {
  const { user, addAddress, editAddress, deleteAddress } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', lat: '', lng: '' });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm({ label: 'Home', street: '', city: '', state: '', pincode: '', lat: '', lng: '' });
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label,
      street: addr.street,
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      lat: addr.lat !== undefined ? String(addr.lat) : '',
      lng: addr.lng !== undefined ? String(addr.lng) : '',
    });
    setShowForm(true);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      toast.error('Location requires a secure (HTTPS) connection');
      return;
    }
    setLocating(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000 // Allow 30s old cached position
    };

    const success = async (pos) => {
      const { latitude, longitude } = pos.coords;
      setForm(prev => ({ ...prev, lat: String(latitude), lng: String(longitude) }));
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          { 
            headers: { 
              'Accept-Language': 'en',
              'User-Agent': 'ChulhaFoodApp/1.0'
            } 
          }
        );
        const data = await res.json();
        const addr = data.address || {};
        setForm(prev => ({
          ...prev,
          street: addr.road || addr.house_number ? `${addr.road || ''} ${addr.house_number || ''}`.trim() : data.display_name?.split(',')[0] || '',
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          pincode: addr.postcode || '',
        }));
        toast.success('Location found');
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        toast.success('Coordinates captured (address lookup failed)');
      } finally {
        setLocating(false);
      }
    };

    const error = (err) => {
      console.error('Geolocation error:', err);
      // If high accuracy failed, try again with low accuracy and no timeout
      if (options.enableHighAccuracy) {
        options.enableHighAccuracy = false;
        options.timeout = 10000;
        navigator.geolocation.getCurrentPosition(success, finalError, options);
      } else {
        finalError(err);
      }
    };

    const finalError = (err) => {
      let msg = 'Failed to get location';
      if (err.code === 1) msg = 'Location permission denied. Please enable it in browser settings.';
      else if (err.code === 2) msg = 'Location unavailable. Ensure "Location Services" is ON in your device/Windows settings.';
      else if (err.code === 3) msg = 'Location request timed out. Try again or enter manually.';
      
      toast.error(msg, { duration: 5000 });
      setLocating(false);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.street) return toast.error('Street address is required');
    setSubmitting(true);
    const payload = {
      label: form.label,
      street: form.street,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    };
    if (form.lat) payload.lat = parseFloat(form.lat);
    if (form.lng) payload.lng = parseFloat(form.lng);
    try {
      if (editingId) {
        await editAddress(editingId, payload);
        toast.success('Address updated');
      } else {
        await addAddress(payload);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addr) => {
    if (addr.isDefault) return;
    try {
      await editAddress(addr._id, { isDefault: true });
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  const addresses = user?.addresses || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-charcoal-900 mb-1">My Dashboard</h1>
      <p className="text-sm text-charcoal-500 mb-8">Welcome back, {user?.name}</p>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 mb-6">
        <h2 className="font-bold text-charcoal-900 mb-4">Profile</h2>
        <div className="space-y-2.5">
          <div>
            <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Name</span>
            <p className="text-sm font-bold text-charcoal-800">{user?.name}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Email</span>
            <p className="text-sm font-bold text-charcoal-800">{user?.email}</p>
          </div>
          {user?.phone && (
            <div>
              <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Phone</span>
              <p className="text-sm font-bold text-charcoal-800">{user.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Addresses Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-charcoal-900">Addresses</h2>
          <button onClick={openAdd} className="flex items-center gap-1 bg-primary-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all">
            <PlusIcon className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPinIcon className="w-6 h-6 text-charcoal-400" />
            </div>
            <p className="text-sm font-bold text-charcoal-700 mb-1">No addresses saved</p>
            <p className="text-xs text-charcoal-500 mb-4">Add a delivery address to get started</p>
            <button onClick={openAdd} className="bg-primary-500 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">Add Address</button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr._id} className={`relative rounded-xl border p-3.5 transition-all ${addr.isDefault ? 'border-primary-300 bg-red-50/40' : 'border-neutral-200 bg-white hover:border-neutral-300'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-charcoal-900">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary-600 bg-red-100 px-1.5 py-0.5 rounded-md">
                          <StarIcon className="w-2.5 h-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-600">{addr.street}</p>
                    {addr.city && <p className="text-xs text-charcoal-500">{addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.pincode ? ` - ${addr.pincode}` : ''}</p>}
                    {addr.lat != null && addr.lng != null && (
                      <p className="text-[10px] text-charcoal-400 mt-1 font-mono">
                        geo: {addr.lat.toFixed(5)}, {addr.lng.toFixed(5)}
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${addr.lat}&mlon=${addr.lng}#map=15/${addr.lat}/${addr.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 text-primary-500 hover:text-primary-600 underline"
                        >
                          View Map
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-charcoal-400 hover:text-primary-500 transition-colors" title="Set as default">
                        <StarIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => openEdit(addr)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-charcoal-400 hover:text-charcoal-700 transition-colors" title="Edit">
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors" title="Delete">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-charcoal-900">{editingId ? 'Edit Address' : 'Add Address'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-charcoal-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
              {/* Left Column: Visual Map Picker */}
              <div className="flex flex-col h-[320px] lg:h-[420px]">
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">Locate on Map</label>
                <GoogleMapPicker
                  defaultLat={form.lat}
                  defaultLng={form.lng}
                  onLocationSelect={(loc) => {
                    setForm(prev => ({
                      ...prev,
                      street: loc.street || prev.street,
                      city: loc.city || prev.city,
                      state: loc.state || prev.state,
                      pincode: loc.pincode || prev.pincode,
                      lat: loc.lat ? String(loc.lat) : prev.lat,
                      lng: loc.lng ? String(loc.lng) : prev.lng,
                    }));
                  }}
                />
              </div>

              {/* Right Column: Address Details Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-600 mb-1">Label</label>
                    <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="input-field text-sm py-2.5">
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-600 mb-1">Street Address *</label>
                    <input type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="input-field text-sm py-2.5" placeholder="123 Main Street" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-600 mb-1">City</label>
                      <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field text-sm py-2.5" placeholder="Mumbai" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-charcoal-600 mb-1">State</label>
                      <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field text-sm py-2.5" placeholder="Maharashtra" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-600 mb-1">Pincode</label>
                    <input type="text" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="input-field text-sm py-2.5" placeholder="400001" />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  {form.lat && form.lng && (
                    <div className="text-[10px] text-charcoal-400 font-mono mb-3 text-center">
                      GPS Captured: {parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 border-2 border-neutral-200 text-charcoal-700 font-bold py-2.5 rounded-xl text-sm hover:bg-neutral-50 transition-all">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 bg-primary-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-95 transition-all text-sm disabled:opacity-50">
                      {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
