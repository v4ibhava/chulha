import { useState, useEffect } from 'react';
import api from '../utils/axios';
import FoodForm from '../components/FoodForm';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { CircleStackIcon } from '@heroicons/react/24/solid';

export default function Foods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editFood, setEditFood] = useState(null);
  const loadFoods = async () => {
    try {
      const { data } = await api.get('/foods?limit=100');
      setFoods(data.foods);
    } catch { toast.error('Failed to load foods'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFoods(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this food item?')) return;
    try {
      await api.delete(`/foods/${id}`);
      toast.success('Food deleted');
      loadFoods();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Foods</h1>
        <button onClick={() => { setEditFood(null); setShowForm(true); }} className="btn-primary">+ Add Food</button>
      </div>
      {loading ? <TableSkeleton /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map(food => (
            <div key={food._id} className="card overflow-hidden animate-fade-in">
              <div className="h-40 bg-gray-200 overflow-hidden">
                {food.image ? <img src={food.image} alt={food.name} className="w-full h-full object-cover" /> : <CircleStackIcon className="w-12 h-12 text-gray-300" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{food.name}</h3>
                  <span className="text-primary-500 font-bold">₹{food.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{food.category?.name} {!food.isAvailable && <span className="text-red-500 ml-2">(Unavailable)</span>}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditFood(food); setShowForm(true); }} className="btn-outline text-xs py-1.5 px-3 flex-1">Edit</button>
                  <button onClick={() => handleDelete(food._id)} className="bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 px-3 rounded-lg flex-1">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <FoodForm food={editFood} onClose={() => { setShowForm(false); setEditFood(null); }} onSaved={() => { toast.success(editFood ? 'Food updated' : 'Food created'); loadFoods(); }} />}
    </div>
  );
}
