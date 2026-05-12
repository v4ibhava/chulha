import { useState, useEffect } from 'react';
import api from '../utils/axios';
import StatCard from '../components/StatCard';
import { StatCardSkeleton } from '../components/LoadingSkeleton';
import { CircleStackIcon, CubeIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/24/solid';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/foods?limit=1'),
      api.get('/orders/all?limit=1'),
      api.get('/orders/myorders'),
    ]).then(([foods, orders, my]) => {
      setStats({
        totalFoods: foods.data.total,
        totalOrders: orders.data.total,
        pendingOrders: orders.data.orders.filter(o => o.status === 'pending').length,
        revenue: orders.data.orders.reduce((sum, o) => sum + o.totalAmount, 0),
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Foods" value={stats.totalFoods} icon={<CircleStackIcon className="w-6 h-6" />} color="bg-blue-500" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={<CubeIcon className="w-6 h-6" />} color="bg-green-500" />
            <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<ClockIcon className="w-6 h-6" />} color="bg-yellow-500" />
            <StatCard title="Revenue" value={`₹${stats.revenue}`} icon={<BanknotesIcon className="w-6 h-6" />} color="bg-primary-500" />
          </>
        )}
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/foods" className="btn-primary text-center">Manage Foods</a>
          <a href="/orders" className="btn-outline text-center">View Orders</a>
        </div>
      </div>
    </div>
  );
}
