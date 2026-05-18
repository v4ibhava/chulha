import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import DeliveryRouteModal from './DeliveryRouteModal';

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
  const [selectedRoute, setSelectedRoute] = useState(null);

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
                  <div className="flex gap-2 items-center mt-1">
                    <button
                      onClick={() => setSelectedRoute({
                        customerName: order.user?.name || 'Customer',
                        addressStreet: order.shippingAddress,
                        addressCity: '',
                        lat: null,
                        lng: null
                      })}
                      className="text-[10px] text-red-500 hover:text-red-600 font-bold inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                      title="Calculate driving route from Central Kitchen"
                    >
                      <span>🚚</span> Route
                    </button>
                    {order.user?.addresses?.length > 0 && (
                      <>
                        <span className="text-gray-300 text-[10px]">|</span>
                        <button
                          onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                          className="text-[10px] text-primary-600 hover:text-primary-700 font-bold inline-flex items-center gap-0.5"
                        >
                          {expanded === order._id ? 'Close' : `Saved (${order.user.addresses.length})`}
                        </button>
                      </>
                    )}
                  </div>
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
                            <p className="text-[10px] text-gray-400 mt-1 font-mono flex items-center flex-wrap gap-1.5">
                              <span>geo: {Number(addr.lat).toFixed(4)}, {Number(addr.lng).toFixed(4)}</span>
                              <button
                                onClick={() => setSelectedRoute({
                                  customerName: order.user?.name || 'Customer',
                                  addressLabel: addr.label,
                                  addressStreet: addr.street,
                                  addressCity: addr.city,
                                  lat: addr.lat,
                                  lng: addr.lng
                                })}
                                className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-extrabold px-1.5 py-0.5 rounded border border-red-200 transition-all cursor-pointer text-[9px] uppercase tracking-wider"
                              >
                                🚚 Show Route
                              </button>
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${addr.lat}&mlon=${addr.lng}#map=15/${addr.lat}/${addr.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600 underline text-[9px] uppercase"
                              >
                                OSM Link
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
      {selectedRoute && (
        <DeliveryRouteModal
          destination={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  );
}
