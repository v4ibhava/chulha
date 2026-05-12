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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-500">Order</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Customer</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Items</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Total</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in">
              <td className="py-3 px-2 font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</td>
              <td className="py-3 px-2">
                <div className="font-medium">{order.user?.name}</div>
                <div className="text-xs text-gray-500">{order.user?.email}</div>
              </td>
              <td className="py-3 px-2">
                <div className="text-xs text-gray-600">{order.items?.length} items</div>
                <div className="text-xs text-gray-400">{order.items?.map(i => i.food?.name).join(', ').slice(0, 30)}</div>
              </td>
              <td className="py-3 px-2 font-semibold">₹{order.totalAmount}</td>
              <td className="py-3 px-2">
                <select value={order.status} onChange={e => onStatusChange(order._id, e.target.value)}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="py-3 px-2 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
