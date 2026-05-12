import { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editCat) await api.put(`/categories/${editCat._id}`, { name });
      else await api.post('/categories', { name });
      toast.success(editCat ? 'Category updated' : 'Category created');
      setShowForm(false);
      setEditCat(null);
      setName('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setEditCat(null); setName(''); setShowForm(true); }} className="btn-primary">+ Add Category</button>
      </div>
      {loading ? <TableSkeleton /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in">
                  <td className="py-3 px-4 font-medium">{cat.name}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => { setEditCat(cat); setName(cat.name); setShowForm(true); }} className="text-primary-500 hover:text-primary-700 mr-3">Edit</button>
                    <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={2} className="py-8 text-center text-gray-400">No categories yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editCat ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Category name" value={name} onChange={e => setName(e.target.value)} className="input-field" required autoFocus />
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
