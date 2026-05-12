import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { StarIcon, CircleStackIcon } from '@heroicons/react/24/solid';

export default function FoodCard({ food }) {
  const { addItem } = useCart();
  const handleAdd = () => {
    addItem({ _id: food._id, name: food.name, price: food.price, image: food.image });
    toast.success(`${food.name} added to cart`);
  };

  return (
    <div className="card overflow-hidden animate-fade-in group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {food.image ? (
          <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <CircleStackIcon className="w-12 h-12 text-gray-300" />
        )}
        {!food.isAvailable && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-lg">Unavailable</span></div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{food.name}</h3>
          <span className="text-primary-500 font-bold">₹{food.price}</span>
        </div>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{food.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{food.category?.name}</span>
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span>{food.rating || '0.0'}</span>
          </div>
        </div>
        <button onClick={handleAdd} disabled={!food.isAvailable} className="btn-primary w-full mt-3 text-sm">
          {food.isAvailable ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
}
