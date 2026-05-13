import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-indigo-100 text-indigo-800',
  'out-for-delivery': 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

export default function OrderTable({ orders, onStatusChange }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-500">Order</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Customer</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Items</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Total</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Shipping</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <>
              <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in">
                <td className="py-3 px-2 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                <td className="py-3 px-2">
                  <div className="font-medium">{order.user?.name}</div>
                  <div className="text-xs text-gray-500">{order.user?.email}</div>
                  {order.phone && <div className="text-xs text-gray-400">{order.phone}</div>}
                </td>
                <td className="py-3 px-2">
                  <div className="text-xs text-gray-600">{order.items?.length} items</div>
                  <div className="text-xs text-gray-400">{order.items?.map(i => i.food?.name).join(', ').slice(0, 30)}</div>
                </td>
                <td className="py-3 px-2 font-semibold">₹{order.totalAmount}</td>
                <td className="py-3 px-2">
                  <div className="text-xs text-gray-700 max-w-[160px] truncate" title={order.shippingAddress}>
                    {order.shippingAddress}
                  </div>
                  {order.user?.addresses?.length > 0 && (
                    <button
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                      className="text-[10px] text-primary-600 hover:text-primary-700 font-bold flex items-center gap-0.5 mt-1"
                    >
                      {expanded === order._id ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                      User Addresses ({order.user.addresses.length})
                    </button>
                  )}
                </td>
                <td className="py-3 px-2">
                  <select value={order.status} onChange={e => onStatusChange(order._id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-3 px-2 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
              {expanded === order._id && order.user?.addresses?.length > 0 && (
                <tr key={`${order._id}-addr`} className="bg-gray-50/80">
                  <td colSpan={7} className="px-4 py-3">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">User Saved Addresses</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {order.user.addresses.map(addr => (
                        <div key={addr._id} className="bg-white rounded-lg border border-gray-200 p-2.5 text-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold text-gray-800">{addr.label}</span>
                            {addr.isDefault && <span className="text-[9px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-gray-600">{addr.street}</p>
                          {addr.city && <p className="text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.pincode ? ` - ${addr.pincode}` : ''}</p>}
                          {addr.lat != null && addr.lng != null && (
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">
                              geo: {Number(addr.lat).toFixed(5)}, {Number(addr.lng).toFixed(5)}
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${addr.lat}&mlon=${addr.lng}#map=15/${addr.lat}/${addr.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1.5 text-primary-500 hover:text-primary-600 underline"
                              >
                                Map
                              </a>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
