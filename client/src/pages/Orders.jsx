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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {loading ? <TableSkeleton /> : orders.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500 mb-4">No orders yet</p>
          <Link to="/menu" className="btn-primary">Start Ordering</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</span>
                  <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span>
                </div>
                <span className="text-primary-500 font-bold">₹{order.totalAmount}</span>
              </div>
              <div className="space-y-2">
                {order.items?.map(item => (
                  <div key={item._id} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">{item.quantity}x</span>
                    <span className="font-medium">{item.food?.name || 'Item'}</span>
                    <span className="text-gray-500">₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
