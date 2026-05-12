import { useState, useEffect } from 'react';
import api from '../utils/axios';
import OrderTable from '../components/OrderTable';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const loadOrders = async () => {
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const { data } = await api.get('/orders/all', { params });
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      loadOrders();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="out-for-delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="card p-4">
        {loading ? <TableSkeleton /> : <OrderTable orders={orders} onStatusChange={handleStatusChange} />}
      </div>
    </div>
  );
}
