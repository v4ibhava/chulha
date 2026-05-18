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
    } catch { 
      toast.error('Failed to load foods'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadFoods(); 
  }, []);

  // Quick Optimistic Toggle for Food Availability directly from the card
  const toggleAvailability = async (id, currentStatus, name) => {
    // 1. Optimistically update local state for absolute zero-latency response
    setFoods(prevFoods => 
      prevFoods.map(f => f._id === id ? { ...f, isAvailable: !currentStatus } : f)
    );

    try {
      // 2. Dispatch quick update in background
      await api.put(`/foods/${id}`, { isAvailable: !currentStatus });
      toast.success(`"${name}" is now ${!currentStatus ? 'Available' : 'Unavailable'}!`);
    } catch (err) {
      // 3. Revert to original status if API call fails
      setFoods(prevFoods => 
        prevFoods.map(f => f._id === id ? { ...f, isAvailable: currentStatus } : f)
      );
      toast.error(`Failed to update availability for "${name}".`);
      console.error('Error toggling food availability:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this food item?')) return;
    try {
      await api.delete(`/foods/${id}`);
      toast.success('Food deleted');
      loadFoods();
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-800">Menu Items</h1>
          <p className="text-charcoal-500 text-sm mt-1">Manage kitchen recipes, pricing, and toggle instant item availability.</p>
        </div>
        <button 
          onClick={() => { setEditFood(null); setShowForm(true); }} 
          className="btn-primary flex items-center gap-1.5"
        >
          <span>➕</span> Add Food Item
        </button>
      </div>

      {loading ? <TableSkeleton /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map(food => (
            <div key={food._id} className="card overflow-hidden animate-fade-in group hover:shadow-lg transition-all border border-neutral-100 flex flex-col h-full bg-white rounded-2xl">
              
              {/* Image Container with Absolute Interactive Overlay Badges */}
              <div className="h-44 bg-neutral-100 overflow-hidden relative shrink-0">
                {food.image ? (
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <CircleStackIcon className="w-12 h-12" />
                  </div>
                )}

                {/* Glassmorphic Availability Quick Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleAvailability(food._id, food.isAvailable, food.name)}
                  className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border ${
                    food.isAvailable
                      ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white border-emerald-400/30'
                      : 'bg-rose-500/90 hover:bg-rose-600 text-white border-rose-400/30'
                  }`}
                  title={`Click to mark as ${food.isAvailable ? 'Unavailable' : 'Available'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${food.isAvailable ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
                  <span>{food.isAvailable ? 'Available' : 'Unavailable'}</span>
                </button>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-neutral-800 text-sm truncate" title={food.name}>{food.name}</h3>
                    <span className="text-primary-500 font-extrabold text-sm shrink-0">₹{food.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {food.category?.name || 'Uncategorized'}
                    </span>
                    {food.rating > 0 && (
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                        ⭐ {food.rating}
                      </span>
                    )}
                  </div>
                  {food.description && (
                    <p className="text-neutral-400 text-xs mt-3 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  )}
                </div>

                {/* Operations Buttons */}
                <div className="flex gap-2.5 mt-5 pt-3 border-t border-neutral-100">
                  <button 
                    onClick={() => { setEditFood(food); setShowForm(true); }} 
                    className="btn-outline py-2 px-3 text-xs font-bold flex-1 cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <button 
                    onClick={() => handleDelete(food._id)} 
                    className="bg-neutral-100 hover:bg-rose-500 hover:text-white text-neutral-600 text-xs font-bold py-2 px-3 rounded-xl flex-1 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <FoodForm 
          food={editFood} 
          onClose={() => { setShowForm(false); setEditFood(null); }} 
          onSaved={() => { 
            toast.success(editFood ? 'Food item details updated!' : 'New food item created!'); 
            loadFoods(); 
          }} 
        />
      )}
    </div>
  );
}
