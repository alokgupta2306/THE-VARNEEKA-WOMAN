import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get('/admin/customers');
      setCustomers(data);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!emailForm.message) { toast.error('Please enter a message'); return; }
    setSending(true);
    try {
      await API.post('/admin/send-email', {
        customerEmail: selected.customerEmail,
        customerName: selected.customerName,
        subject: emailForm.subject || 'Message from The Varneeka Woman',
        message: emailForm.message
      });
      toast.success('Email sent!');
      setSelected(null);
      setEmailForm({ subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const sendAll = async () => {
    if (!emailForm.message) { toast.error('Please enter a message'); return; }
    setSendingAll(true);
    try {
      await API.post('/admin/send-email-all', {
        subject: emailForm.subject || 'Message from The Varneeka Woman',
        message: emailForm.message
      });
      toast.success('Emails sent to all customers!');
      setEmailForm({ subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send emails');
    } finally {
      setSendingAll(false);
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
        <h2 style={styles.title}>Track Customers</h2>
        <div style={styles.divider} />

        {/* Bulk Email Box */}
        <div style={styles.bulkBox}>
          <h3 style={styles.bulkTitle}>Send Message to All Customers</h3>
          <div style={styles.bulkForm}>
            <input
              placeholder="Subject (optional)"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              style={styles.bulkInput}
            />
            <textarea
              placeholder="Write your message here..."
              value={emailForm.message}
              onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
              style={styles.bulkTextarea}
              rows={3}
            />
            <button style={styles.sendAllBtn} onClick={sendAll} disabled={sendingAll}>
              {sendingAll ? 'Sending...' : '📧 Send to All Customers'}
            </button>
          </div>
        </div>

        {/* Customer Cards */}
        {loading ? (
          <p style={styles.loadingText}>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p style={styles.emptyText}>No customers yet</p>
        ) : (
          <div style={styles.grid}>
            {customers.map(order => (
              <div key={order._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>
                    {order.customerName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={styles.customerName}>{order.customerName}</h3>
                    <p style={styles.customerEmail}>{order.customerEmail}</p>
                    <p style={styles.customerPhone}>{order.customerPhone}</p>
                  </div>
                </div>

                <div style={styles.orderInfo}>
                  <img
                    src={`http://localhost:5000${order.product?.image}`}
                    alt={order.product?.name}
                    style={styles.productThumb}
                  />
                  <div>
                    <p style={styles.productName}>{order.product?.name}</p>
                    <p style={styles.trackingId}>#{order.trackingId}</p>
                    <span style={{ ...styles.statusBadge, color: statusColor(order.orderStatus), borderColor: statusColor(order.orderStatus) }}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <button style={styles.messageBtn} onClick={() => setSelected(order)}>
                  ✉️ Send Message
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Email Modal */}
        {selected && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Send Message</h3>
              <p style={styles.modalSub}>To: {selected.customerName} ({selected.customerEmail})</p>
              <div style={styles.dividerSmall} />
              <div style={styles.field}>
                <label>Subject</label>
                <input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="e.g. Your order update"
                />
              </div>
              <div style={styles.field}>
                <label>Message</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Write your message..."
                  rows={5}
                  style={styles.textarea}
                />
              </div>
              <div style={styles.modalBtns}>
                <button style={styles.sendBtn} onClick={sendEmail} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
                <button style={styles.cancelBtn} onClick={() => setSelected(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
  title: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#6B1B2A', letterSpacing: '3px' },
  divider: { width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px 0 40px' },
  bulkBox: { background: '#fff', border: '1px solid #F5ECD8', padding: '24px', marginBottom: '40px' },
  bulkTitle: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#6B1B2A', letterSpacing: '2px', marginBottom: '16px' },
  bulkForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  bulkInput: { padding: '12px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '13px', outline: 'none' },
  bulkTextarea: { padding: '12px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '13px', outline: 'none', resize: 'vertical' },
  sendAllBtn: {
    background: '#6B1B2A', color: '#C9A84C', border: '1px solid #C9A84C',
    padding: '12px 24px', fontFamily: 'Cinzel, serif', fontSize: '12px',
    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase', alignSelf: 'flex-start',
  },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', textAlign: 'center', padding: '40px', letterSpacing: '2px' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#6B1B2A', textAlign: 'center', padding: '60px', fontStyle: 'italic' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  card: { background: '#fff', border: '1px solid #F5ECD8', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  cardTop: { display: 'flex', gap: '12px', alignItems: 'center' },
  avatar: {
    width: '48px', height: '48px', borderRadius: '50%', background: '#6B1B2A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#C9A84C', flexShrink: 0,
  },
  customerName: { fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#6B1B2A', letterSpacing: '1px' },
  customerEmail: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888', marginTop: '2px' },
  customerPhone: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#aaa', marginTop: '2px' },
  orderInfo: { display: 'flex', gap: '12px', alignItems: 'center', background: '#FDF6EC', padding: '12px' },
  productThumb: { width: '56px', height: '56px', objectFit: 'cover', flexShrink: 0 },
  productName: { fontFamily: 'Raleway, sans-serif', fontSize: '13px', color: '#2C2C2C', marginBottom: '4px' },
  trackingId: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px', marginBottom: '4px' },
  statusBadge: { fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', padding: '3px 8px', border: '1px solid', textTransform: 'uppercase' },
  messageBtn: {
    background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C',
    padding: '10px', fontFamily: 'Cinzel, serif', fontSize: '11px',
    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { background: '#FDF6EC', padding: '40px', maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalTitle: { fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#6B1B2A', letterSpacing: '2px' },
  modalSub: { fontFamily: 'Raleway, sans-serif', fontSize: '13px', color: '#888' },
  dividerSmall: { height: '1px', background: '#E2C97E' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  textarea: { padding: '12px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '13px', outline: 'none', resize: 'vertical' },
  modalBtns: { display: 'flex', gap: '12px' },
  sendBtn: {
    background: '#6B1B2A', color: '#C9A84C', border: 'none',
    padding: '12px 32px', fontFamily: 'Cinzel, serif', fontSize: '12px',
    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
  },
  cancelBtn: {
    background: 'transparent', border: '1px solid #ddd', color: '#888',
    padding: '12px 24px', fontFamily: 'Raleway, sans-serif', fontSize: '13px', cursor: 'pointer',
  },
};

export default AdminCustomers;