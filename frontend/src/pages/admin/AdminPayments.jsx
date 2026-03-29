import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API, { getImageUrl } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await API.get('/admin/payments');
      setPayments(data);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const total = payments.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>Payment Receiver</h2>
        <div style={styles.divider} />

        {/* Total Revenue Card */}
        <div style={styles.revenueCard}>
          <p style={styles.revenueLabel}>Total Revenue</p>
          <p style={styles.revenueAmount}>₹{total.toLocaleString()}</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p style={styles.emptyText}>No payments received yet</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Saree</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Payment ID</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.name}>{payment.customerName}</p>
                      <p style={styles.email}>{payment.customerEmail}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.productName}>{payment.product?.name}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.amount}>₹{payment.totalAmount?.toLocaleString()}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.paymentId}>{payment.razorpayPaymentId || 'N/A'}</p>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.date}>{new Date(payment.createdAt).toLocaleDateString('en-IN')}</p>
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
  page: { maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' },
  title: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#6B1B2A', letterSpacing: '3px' },
  divider: { width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px 0 40px' },
  revenueCard: { background: '#6B1B2A', padding: '32px', textAlign: 'center', marginBottom: '40px', display: 'inline-block', minWidth: '240px' },
  revenueLabel: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#C9A84C', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  revenueAmount: { fontFamily: 'Cinzel, serif', fontSize: '36px', color: '#C9A84C' },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', textAlign: 'center', padding: '40px', letterSpacing: '2px' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#6B1B2A', textAlign: 'center', padding: '60px', fontStyle: 'italic' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#6B1B2A' },
  th: { fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#C9A84C', letterSpacing: '2px', padding: '14px 12px', textAlign: 'left', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #F5ECD8' },
  td: { padding: '16px 12px', verticalAlign: 'middle' },
  name: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px' },
  email: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#888', marginTop: '2px' },
  productName: { fontFamily: 'Raleway, sans-serif', fontSize: '13px', color: '#2C2C2C' },
  amount: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#27AE60' },
  paymentId: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px' },
  date: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888' },
};

export default AdminPayments;