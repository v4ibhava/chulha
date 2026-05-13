import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/solid';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  'out-for-delivery': 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-charcoal-900 mb-8">My Orders</h1>
      {loading ? <TableSkeleton /> : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardDocumentListIcon className="w-8 h-8 text-charcoal-400" />
          </div>
          <p className="text-lg font-bold text-charcoal-700 mb-4">No orders yet</p>
          <Link to="/menu" className="btn-primary text-sm">Start Ordering</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-charcoal-500">Order #{order._id.slice(-8).toUpperCase()}</span>
                  <span className={`ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColors[order.status]}`}>{order.status}</span>
                </div>
                <span className="text-primary-500 font-black">₹{order.totalAmount}</span>
              </div>
              <div className="space-y-1.5">
                {order.items?.map(item => (
                  <div key={item._id} className="flex items-center gap-2 text-sm">
                    <span className="text-charcoal-400 font-bold">{item.quantity}x</span>
                    <span className="font-bold text-charcoal-900">{item.food?.name || 'Item'}</span>
                    <span className="text-charcoal-500">₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-charcoal-400 font-medium">
                Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
