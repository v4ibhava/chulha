import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

export default function Cart() {
  const { items, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCartIcon className="w-8 h-8 text-charcoal-400" />
        </div>
        <h2 className="text-xl font-bold text-charcoal-900 mb-1">Your cart is empty</h2>
        <p className="text-sm text-charcoal-500 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/menu" className="btn-primary text-sm">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-charcoal-900">Your Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-bold">Clear All</button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 mb-6">
        {items.map(item => <CartItem key={item._id} item={item} />)}
      </div>
      <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-charcoal-900">Total</span>
          <span className="text-2xl font-black text-primary-500">₹{totalPrice}</span>
        </div>
        <Link to="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
      </div>
    </div>
  );
}
