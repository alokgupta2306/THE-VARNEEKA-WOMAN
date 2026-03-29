import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API, { getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get('/admin/analytics');
      setData(data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading analytics...</p>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Orders', value: data?.totalOrders, icon: '📦' },
    { label: 'Total Revenue', value: `₹${data?.totalRevenue?.toLocaleString()}`, icon: '💰' },
    { label: 'Total Customers', value: data?.totalCustomers, icon: '👥' },
    { label: 'Total Products', value: data?.totalProducts, icon: '👗' },
  ];

  const statusData = data?.ordersByStatus || {};

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>Analytics Dashboard</h2>
        <div style={styles.divider} />

        {/* Stat Cards */}
        <div style={styles.statsGrid}>
          {statCards.map(card => (
            <div key={card.label} style={styles.statCard}>
              <span style={styles.statIcon}>{card.icon}</span>
              <p style={styles.statValue}>{card.value}</p>
              <p style={styles.statLabel}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Orders by Status */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Orders by Status</h3>
          <div style={styles.statusGrid}>
            {Object.entries(statusData).map(([status, count]) => {
              const colors = { Pending: '#888', Confirmed: '#C9A84C', Shipped: '#4A90D9', Delivered: '#27AE60' };
              const total = Object.values(statusData).reduce((a, b) => a + b, 0);
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} style={styles.statusCard}>
                  <div style={{ ...styles.statusBar, background: colors[status] || '#888', height: `${Math.max(percent * 2, 8)}px` }} />
                  <p style={{ ...styles.statusCount, color: colors[status] }}>{count}</p>
                  <p style={styles.statusLabel}>{status}</p>
                  <p style={styles.statusPercent}>{percent}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Orders</h3>
          {data?.recentOrders?.length === 0 ? (
            <p style={styles.emptyText}>No recent orders</p>
          ) : (
            <div style={styles.recentList}>
              {data?.recentOrders?.map(order => (
                <div key={order._id} style={styles.recentCard}>
                  <img
                  src={getImageUrl(order.product?.image)}
                   alt={order.product?.name}
                   style={styles.orderProductImg}
                  />
                  <div style={styles.recentInfo}>
                    <p style={styles.recentProduct}>{order.product?.name}</p>
                    <p style={styles.recentCustomer}>{order.customerName}</p>
                    <p style={styles.recentDate}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div style={styles.recentRight}>
                    <p style={styles.recentAmount}>₹{order.totalAmount?.toLocaleString()}</p>
                    <p style={styles.recentStatus}>{order.orderStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  loadingPage: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', letterSpacing: '3px' },
  page: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
  title: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#6B1B2A', letterSpacing: '3px' },
  divider: { width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px 0 40px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' },
  statCard: { background: '#6B1B2A', padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  statIcon: { fontSize: '32px' },
  statValue: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#C9A84C' },
  statLabel: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#FDF6EC', letterSpacing: '2px', textTransform: 'uppercase' },
  section: { background: '#fff', border: '1px solid #F5ECD8', padding: '32px', marginBottom: '32px' },
  sectionTitle: { fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#6B1B2A', letterSpacing: '2px', marginBottom: '24px', textTransform: 'uppercase' },
  statusGrid: { display: 'flex', gap: '24px', alignItems: 'flex-end', justifyContent: 'center', minHeight: '120px' },
  statusCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px' },
  statusBar: { width: '48px', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' },
  statusCount: { fontFamily: 'Cinzel, serif', fontSize: '20px' },
  statusLabel: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' },
  statusPercent: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#aaa', fontStyle: 'italic' },
  recentList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  recentCard: { display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: '#FDF6EC' },
  recentImg: { width: '56px', height: '56px', objectFit: 'cover', flexShrink: 0 },
  recentInfo: { flex: 1 },
  recentProduct: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px', marginBottom: '4px' },
  recentCustomer: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888' },
  recentDate: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', marginTop: '2px' },
  recentRight: { textAlign: 'right' },
  recentAmount: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#6B1B2A' },
  recentStatus: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#888', marginTop: '4px', letterSpacing: '1px' },
};

export default AdminAnalytics;