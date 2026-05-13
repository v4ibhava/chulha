import { useState, useEffect } from 'react';
import api from '../utils/axios';
import StatCard from '../components/StatCard';
import { StatCardSkeleton } from '../components/LoadingSkeleton';
import { 
  CircleStackIcon, 
  CubeIcon, 
  ClockIcon, 
  BanknotesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foods, orders] = await Promise.all([
          api.get('/foods?limit=1'),
          api.get('/orders/all?limit=100'),
        ]);
        setStats({
          totalFoods: foods.data.total,
          totalOrders: orders.data.total,
          pendingOrders: orders.data.orders.filter(o => o.status === 'pending').length,
          revenue: orders.data.orders.reduce((sum, o) => sum + o.totalAmount, 0),
          recentOrders: orders.data.orders.slice(0, 5)
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-800">Dashboard</h1>
          <p className="text-charcoal-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-neutral-200">
          <div className="p-2 bg-primary-50 rounded-lg">
            <CalendarDaysIcon className="w-5 h-5 text-primary-500" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">{formatDate(currentTime)}</p>
            <p className="text-lg font-display font-bold text-charcoal-800">{formatTime(currentTime)}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Foods" value={stats.totalFoods} icon={<CircleStackIcon className="w-6 h-6" />} color="text-blue-500" bgColor="bg-blue-50" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={<CubeIcon className="w-6 h-6" />} color="text-green-500" bgColor="bg-green-50" />
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<ClockIcon className="w-6 h-6" />} color="text-amber-500" bgColor="bg-amber-50" />
            <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<BanknotesIcon className="w-6 h-6" />} color="text-primary-500" bgColor="bg-primary-50" />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal-800">Recent Orders</h2>
            <a href="/orders" className="text-primary-500 text-sm font-semibold hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="h-40 bg-white rounded-2xl animate-pulse" />
            ) : stats.recentOrders?.length > 0 ? (
              stats.recentOrders.map(order => (
                <div key={order._id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-charcoal-400 font-bold">
                      #{order._id.slice(-4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-800">{order.user?.name || 'Customer'}</p>
                      <p className="text-xs text-charcoal-400">{order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-primary-500">₹{order.totalAmount}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-8 text-center text-charcoal-400">
                No orders found yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="card p-6 bg-charcoal-700 text-white border-none shadow-xl shadow-charcoal-700/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h2 className="text-lg font-bold mb-4 relative">Quick Actions</h2>
            <div className="space-y-3 relative">
              <a href="/foods" className="block w-full btn-primary text-center py-3">Add New Food</a>
              <a href="/categories" className="block w-full bg-charcoal-600 hover:bg-charcoal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all text-center">Manage Categories</a>
            </div>
          </div>

          <div className="card p-6 border-dashed border-2 border-neutral-300 bg-transparent shadow-none">
            <h3 className="text-sm font-bold text-charcoal-500 uppercase tracking-widest mb-3">Kitchen Status</h3>
            <div className="flex items-center gap-3 text-charcoal-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm font-medium">System operational</p>
            </div>
            <p className="text-xs text-charcoal-400 mt-2">All services are running smoothly. Prep time is currently averaging 15 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
