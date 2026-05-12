import { useCart } from '../context/CartContext';
import { CircleStackIcon } from '@heroicons/react/24/solid';

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 animate-fade-in">
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <CircleStackIcon className="w-6 h-6 text-gray-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
        <p className="text-primary-500 font-semibold">₹{item.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">-</button>
        <span className="w-8 text-center font-medium">{item.qty}</span>
        <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">+</button>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">₹{item.price * item.qty}</p>
        <button onClick={() => removeItem(item._id)} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
      </div>
    </div>
  );
}
