import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FireIcon, ShoppingCartIcon, Bars3Icon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <FireIcon className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Chulha</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Home</Link>
            <Link to="/menu" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Menu</Link>
            {user ? (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Orders</Link>
                <Link to="/cart" className="relative text-gray-600 hover:text-primary-500 transition-colors">
                  <ShoppingCartIcon className="w-5 h-5" />
                  {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{totalItems}</span>}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Hi, {user.name}</span>
                  <button onClick={handleLogout} className="btn-primary text-sm py-2 px-4">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-gray-600"><Bars3Icon className="w-6 h-6" /></button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-3 pt-3">
            <Link to="/" onClick={() => setOpen(false)} className="text-gray-600 font-medium">Home</Link>
            <Link to="/menu" onClick={() => setOpen(false)} className="text-gray-600 font-medium">Menu</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setOpen(false)} className="text-gray-600 font-medium">Orders</Link>
                <Link to="/cart" onClick={() => setOpen(false)} className="text-gray-600 font-medium">Cart ({totalItems})</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="btn-primary text-sm text-left">Logout</button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline text-sm flex-1 text-center">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm flex-1 text-center">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
