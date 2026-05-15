import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { ClipboardDocumentListIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const statusFlow = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];

const statusMeta = {
  pending: { label: 'Pending', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-100' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-100' },
  preparing: { label: 'Preparing', color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-100' },
  'out-for-delivery': { label: 'Out for Delivery', color: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-100' },
  delivered: { label: 'Delivered', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-100' },
};

function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
        <XCircleIcon className="w-5 h-5" />
        <span>Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = statusFlow.indexOf(status);

  return (
    <div className="flex items-center w-full">
      {statusFlow.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${done ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'bg-neutral-200 text-neutral-400'}`}>
                {done && i < statusFlow.length - 1 ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] font-bold mt-1 whitespace-nowrap ${done ? 'text-primary-600' : 'text-neutral-400'}`}>
                {statusMeta[s].label}
              </span>
            </div>
            {i < statusFlow.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1.5 mb-5 ${i < currentIdx ? 'bg-primary-500' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-neutral-100 p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal-500">Order #{order._id.slice(-8).toUpperCase()}</span>
                  {order.status === 'cancelled' && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusMeta.cancelled.bg} ${statusMeta.cancelled.text}`}>Cancelled</span>
                  )}
                  {order.status === 'delivered' && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusMeta.delivered.bg} ${statusMeta.delivered.text}`}>Delivered</span>
                  )}
                </div>
                <span className="text-primary-500 font-black text-lg">₹{order.totalAmount}</span>
              </div>

              <StatusTimeline status={order.status} />

              <div className="mt-5 space-y-1.5 border-t border-neutral-100 pt-4">
                {order.items?.map(item => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal-400 font-bold min-w-[2rem]">{item.quantity}x</span>
                      <span className="font-bold text-charcoal-900">{item.food?.name || 'Item'}</span>
                    </div>
                    <span className="text-charcoal-600">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-charcoal-400 font-medium">
                <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {order.shippingAddress && <span className="truncate max-w-[200px]">{order.shippingAddress}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}