import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API, { getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const statusColor = (status) => {
    const colors = { Pending: '#888', Confirmed: '#C9A84C', Shipped: '#4A90D9', Delivered: '#27AE60' };
    return colors[status] || '#888';
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>All Orders</h2>
        <div style={styles.divider} />

        {loading ? (
          <p style={styles.loadingText}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={styles.emptyText}>No orders yet</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Saree</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Tracking ID</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.customerName}>{order.customerName}</p>
                      <p style={styles.customerEmail}>{order.customerEmail}</p>
                      <p style={styles.customerPhone}>{order.customerPhone}</p>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.productCell}>
                        <img
                         src={getImageUrl(order.product?.image)}
                           alt={order.product?.name}
                             style={styles.orderProductImg}
                        />
                        <span style={styles.productCellName}>{order.product?.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.amount}>₹{order.totalAmount?.toLocaleString()}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.payBadge, color: order.paymentStatus === 'Paid' ? '#27AE60' : '#888' }}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, color: statusColor(order.orderStatus), borderColor: statusColor(order.orderStatus) }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.trackingId}>{order.trackingId}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.date}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: '1300px', margin: '0 auto', padding: '60px 20px' },
  title: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#6B1B2A', letterSpacing: '3px' },
  divider: { width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px 0 40px' },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', textAlign: 'center', padding: '40px', letterSpacing: '2px' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#6B1B2A', textAlign: 'center', padding: '60px', fontStyle: 'italic' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#6B1B2A' },
  th: { fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#C9A84C', letterSpacing: '2px', padding: '14px 12px', textAlign: 'left', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #F5ECD8', transition: 'background 0.2s' },
  td: { padding: '16px 12px', verticalAlign: 'middle' },
  customerName: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px' },
  customerEmail: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#888', marginTop: '2px' },
  customerPhone: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', marginTop: '2px' },
  productCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  productThumb: { width: '48px', height: '48px', objectFit: 'cover', flexShrink: 0 },
  productCellName: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#2C2C2C' },
  amount: { fontFamily: 'Cinzel, serif', fontSize: '15px', color: '#2C2C2C' },
  payBadge: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', letterSpacing: '1px' },
  statusBadge: { fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1px', padding: '4px 10px', border: '1px solid', textTransform: 'uppercase' },
  trackingId: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px' },
  date: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888' },
  statusSelect: { padding: '8px 12px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '12px', outline: 'none', background: '#fff', cursor: 'pointer' },
};

export default AdminOrders;