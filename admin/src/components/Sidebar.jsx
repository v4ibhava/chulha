import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  CircleStackIcon, 
  FolderIcon, 
  CubeIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const links = [
  { to: '/', label: 'Statistics', icon: HomeIcon },
  { to: '/foods', label: 'Menu Items', icon: CircleStackIcon },
  { to: '/categories', label: 'Categories', icon: FolderIcon },
  { to: '/orders', label: 'Active Orders', icon: CubeIcon },
  { to: '/select-kitchen', label: 'Kitchen Outlets', icon: MapIcon },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasActiveKitchen = (() => {
    try {
      const saved = localStorage.getItem('chulha_kitchen_coords');
      return !!saved;
    } catch {
      return false;
    }
  })();

  const visibleLinks = hasActiveKitchen 
    ? links 
    : links.filter(link => link.to === '/select-kitchen');

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-charcoal-700 text-white">
      <div className="p-8 border-b border-charcoal-600/50">
        <div className="flex items-center gap-3">
          <img src="/images/chulha-logo.png" alt="Chulha" className="h-10 w-auto" />
          <div>
            <h2 className="font-display font-bold text-lg leading-tight tracking-tight">CHULHA</h2>
            <p className="text-charcoal-300 text-[10px] uppercase tracking-[0.1em] font-semibold">Management Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-2">
        {visibleLinks.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            end={link.to === '/'} 
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group
              ${isActive 
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                : 'text-charcoal-200 hover:bg-charcoal-600/50 hover:text-white'
              }
            `}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-charcoal-600/50">
        {/* Active Kitchen Block inside Sidebar Footer */}
        {(() => {
          try {
            const saved = localStorage.getItem('chulha_kitchen_coords');
            if (saved) {
              const parsed = JSON.parse(saved);
              return (
                <div className="mb-4 p-3 rounded-xl bg-charcoal-800 border border-charcoal-600/40 flex flex-col gap-1.5 animate-fade-in shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🍳</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate" title={parsed.name}>{parsed.name}</p>
                      <p className="text-[9px] text-charcoal-400 uppercase tracking-widest font-semibold">Active Kitchen</p>
                    </div>
                  </div>
                </div>
              );
            }
          } catch (e) {
            console.error("Failed to render kitchen badge in sidebar footer", e);
          }
          return null;
        })()}

        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-500 text-xs font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] text-charcoal-400 truncate">{user?.email || 'admin@chulha.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal-300 hover:bg-red-500/10 hover:text-red-500 transition-all w-full text-sm font-medium group"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-charcoal-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setMobileOpen(true)} 
        className="lg:hidden fixed top-4 left-4 z-50 bg-charcoal-700 text-white p-2.5 rounded-xl shadow-lg border border-charcoal-600"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
      
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 shadow-2xl z-40">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-charcoal-700 z-50 animate-slide-in shadow-2xl">
            <div className="absolute top-4 right-4 lg:hidden">
              <button onClick={() => setMobileOpen(false)} className="text-charcoal-400 hover:text-white p-1">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
