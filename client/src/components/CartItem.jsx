import { useCart } from '../context/CartContext';
import { CircleStackIcon } from '@heroicons/react/24/solid';

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-neutral-200 animate-fade-in">
      <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <CircleStackIcon className="w-5 h-5 text-charcoal-300 m-auto mt-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-charcoal-900 truncate">{item.name}</h4>
        <p className="text-primary-500 font-bold text-sm">₹{item.price}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-7 h-7 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 text-sm font-bold transition-colors">−</button>
        <span className="w-6 text-center text-sm font-bold text-charcoal-900">{item.qty}</span>
        <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-7 h-7 rounded-lg border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 text-sm font-bold transition-colors">+</button>
      </div>
      <div className="text-right min-w-[70px]">
        <p className="font-bold text-sm text-charcoal-900">₹{item.price * item.qty}</p>
        <button onClick={() => removeItem(item._id)} className="text-[11px] text-red-500 hover:text-red-700 font-bold">Remove</button>
      </div>
    </div>
  );
}
