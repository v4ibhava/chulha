import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FireIcon, HomeIcon, CircleStackIcon, FolderIcon, CubeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

const links = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/foods', label: 'Foods', icon: CircleStackIcon },
  { to: '/categories', label: 'Categories', icon: FolderIcon },
  { to: '/orders', label: 'Orders', icon: CubeIcon },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FireIcon className="w-6 h-6 text-primary-500" />
          <div>
            <h2 className="text-white font-bold">Chulha Admin</h2>
            <p className="text-gray-400 text-xs">Management Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium group ${isActive ? 'bg-primary-500 text-white' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}>
            <link.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-gray-700 hover:text-white transition-all w-full text-sm font-medium">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2.5 rounded-lg shadow-lg">
        ☰
      </button>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900">
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 z-50 animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
