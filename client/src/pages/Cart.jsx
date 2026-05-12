import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ShoppingCartIcon, FaceFrownIcon } from '@heroicons/react/24/solid';

export default function Cart() {
  const { items, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear All</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {items.map(item => <CartItem key={item._id} item={item} />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary-500">₹{totalPrice}</span>
        </div>
        <Link to="/checkout" className="btn-primary w-full text-center block">Proceed to Checkout</Link>
      </div>
    </div>
  );
}
