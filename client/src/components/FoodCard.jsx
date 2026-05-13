import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

export default function FoodCard({ food }) {
  const { addItem } = useCart();
  const handleAdd = (e) => {
    e.preventDefault();
    addItem({ _id: food._id, name: food.name, price: food.price, image: food.image });
    toast.success(`${food.name} added to cart`);
  };

  return (
    <div className="card group animate-fade-in">
      <div className="relative h-40 bg-neutral-200 overflow-hidden">
        {food.image ? (
          <img 
            src={food.image} 
            alt={food.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
            No Image
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/50">
            <StarIcon className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs font-black text-charcoal-800">{food.rating || '4.5'}</span>
          </div>
        </div>
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-white font-black text-xl tracking-widest uppercase border-2 border-white/30 px-6 py-2 rounded-xl">Sold Out</span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-red-50 px-1.5 py-0.5 rounded-md">
            {food.category?.name || 'Category'}
          </span>
          <span className="text-base font-display font-black text-primary-500">₹{food.price}</span>
        </div>
        
        <h3 className="font-display font-black text-base text-charcoal-900 mb-1 truncate">{food.name}</h3>
        <p className="text-xs text-charcoal-500 mb-3 line-clamp-2 min-h-[2rem] leading-relaxed">{food.description}</p>
        
        <button 
          onClick={handleAdd} 
          disabled={!food.isAvailable} 
          className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5 text-xs"
        >
          <ShoppingCartIcon className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
