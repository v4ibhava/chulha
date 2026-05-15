import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon, Bars3Icon, MapPinIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const addrDisplay = defaultAddr
    ? `${defaultAddr.label} · ${defaultAddr.street}`
    : user?.address
      ? `Home · ${user.address}`
      : 'Home · 123 Main Street';

  return (
    <nav className="bg-white/80 backdrop-blur-2xl border-b border-neutral-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Address */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img src="/images/chulha-logo.png" alt="Chulha" className="h-8 w-auto group-hover:scale-110 transition-all" />
              <span className="text-lg font-display font-black text-charcoal-900 tracking-tight hidden sm:inline">CHULHA</span>
            </Link>
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-neutral-200">
              <div className="flex items-center gap-1 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200">
                <MapPinIcon className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span className="text-[11px] font-bold text-charcoal-600 truncate max-w-[180px]">{addrDisplay}</span>
              </div>
            </div>
          </div>

          {/* Right: Sign In / User */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                  <ShoppingBagIcon className="w-5 h-5 text-charcoal-700" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[9px] rounded-full min-w-[16px] min-h-[16px] flex items-center justify-center font-black shadow-md shadow-primary-500/30 leading-none px-1">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-xs font-bold text-charcoal-700 hover:text-primary-500 transition-colors px-2"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors px-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 bg-primary-500 text-white font-bold py-2 px-4 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm">
                <UserCircleIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-neutral-100 text-charcoal-700 transition-colors">
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-neutral-100 px-4 py-4 animate-fade-in shadow-xl rounded-b-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-neutral-100 px-3 py-2.5 rounded-xl mb-1">
              <MapPinIcon className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              <span className="text-xs font-bold text-charcoal-600 truncate max-w-[220px]">{addrDisplay}</span>
            </div>
            <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-neutral-100 text-charcoal-800 font-bold text-sm transition-colors">Home</Link>
            <Link to="/menu" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-neutral-100 text-charcoal-800 font-bold text-sm transition-colors">Menu</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-neutral-100 text-charcoal-800 font-bold text-sm transition-colors">Dashboard</Link>
                <Link to="/orders" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-neutral-100 text-charcoal-800 font-bold text-sm transition-colors">Orders</Link>
                <Link to="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-100 text-charcoal-800 font-bold text-sm transition-colors">
                  Cart
                  {totalItems > 0 && <span className="bg-primary-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{totalItems}</span>}
                </Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="w-full bg-red-50 text-red-500 font-bold py-2.5 px-3 rounded-xl text-sm text-center hover:bg-red-100 transition-colors">Sign Out</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Link to="/login" onClick={() => setOpen(false)} className="border-2 border-primary-500 text-primary-500 font-bold py-2.5 px-3 rounded-xl text-sm text-center hover:bg-red-50 transition-all">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="bg-primary-500 text-white font-bold py-2.5 px-3 rounded-xl text-sm text-center shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
