import { useState, useEffect } from 'react';
import api from '../utils/axios';

export default function FoodForm({ food, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', isAvailable: true, rating: 0 });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories))
      .catch(() => setError('Unable to load categories. Check that the API server is running.'));
    if (food) setForm({ name: food.name, description: food.description || '', price: food.price, category: food.category?._id || food.category, isAvailable: food.isAvailable, rating: food.rating || 0 });
  }, [food]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!food && !image) {
      setError('Please choose an image for this food item.');
      return;
    }
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('category', form.category);
    fd.append('isAvailable', form.isAvailable);
    fd.append('rating', form.rating);
    if (image) fd.append('image', image);

    try {
      if (food) await api.put(`/foods/${food._id}`, fd);
      else await api.post('/foods', fd);
      onSaved();
      onClose();
    } catch (err) {
      const message = err.code === 'ECONNABORTED'
        ? 'Saving timed out. Check the API server and Cloudinary settings.'
        : err.response?.data?.message || 'Error saving food';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{food ? 'Edit Food' : 'Add Food'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" required min="0" step="0.01" />
            <input type="number" placeholder="Rating (0-5)" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className="input-field" min="0" max="5" step="0.1" />
          </div>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field" required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700">Available</span>
          </label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="text-sm" required={!food} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
