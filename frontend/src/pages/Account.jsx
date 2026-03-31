import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [feedbackForm, setFeedbackForm] = useState({ orderId: '', rating: 5, comment: '' });
  const [showFeedback, setShowFeedback] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/my');
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFeedback = async (orderId) => {
    try {
      await API.post(`/orders/${orderId}/feedback`, {
        rating: feedbackForm.rating,
        comment: feedbackForm.comment
      });
      toast.success('Feedback submitted!');
      setShowFeedback(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const statusColor = (status) => {
    const colors = {
      Pending: '#888',
      Confirmed: '#C9A84C',
      Shipped: '#4A90D9',
      Delivered: '#27AE60'
    };
    return colors[status] || '#888';
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        {/* Profile Card */}
        <div style={styles.profileCard} className="profile-card">
          <div style={styles.profileAvatar}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt="profile" style={styles.avatarImg} />
            ) : (
              <span style={styles.avatarLetter}>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h2 style={styles.profileName}>{user?.name}</h2>
          <p style={styles.profileEmail}>{user?.email}</p>
          <div style={styles.divider} />
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }}
              onClick={() => setActiveTab('orders')}
            >
              My Orders
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'track' ? styles.activeTab : {}) }}
              onClick={() => setActiveTab('track')}
            >
              Track Orders
            </button>
          </div>

          {activeTab === 'orders' && (
            <div style={styles.ordersSection}>
              {loading ? (
                <p style={styles.loadingText}>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div style={styles.emptyBox}>
                  <p style={styles.emptyText}>No orders yet</p>
                  <button style={styles.shopBtn} onClick={() => navigate('/')}>Start Shopping</button>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order._id} style={styles.orderCard}>
                    <div style={styles.orderTop} className="order-top">
                      <div style={styles.orderImg}>
                        <img src={getImageUrl(order.product?.image)} alt={order.product?.name} style={styles.orderProductImg} />
                      </div>
                      <div style={styles.orderInfo}>
                        <h3 style={styles.orderProductName}>{order.product?.name}</h3>
                        <p style={styles.orderDetail}>{order.product?.fabric} · {order.product?.colour}</p>
                        <p style={styles.orderAmount}>₹{order.totalAmount?.toLocaleString()}</p>
                        <p style={styles.orderTracking}>Tracking ID: {order.trackingId}</p>
                      </div>
                      <div style={styles.orderStatus}>
                        <span style={{ ...styles.statusBadge, color: statusColor(order.orderStatus), borderColor: statusColor(order.orderStatus) }}>
                          {order.orderStatus}
                        </span>
                        <p style={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {order.orderStatus === 'Delivered' && !order.feedback?.rating && (
                      <div style={styles.feedbackRow}>
                        {showFeedback === order._id ? (
                          <div style={styles.feedbackForm}>
                            <p style={styles.feedbackTitle}>Rate your experience</p>
                            <select
                              value={feedbackForm.rating}
                              onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                              style={styles.feedbackSelect}
                            >
                              {[5,4,3,2,1].map(n => (
                                <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                            <textarea
                              placeholder="Share your experience (optional)"
                              value={feedbackForm.comment}
                              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                              style={styles.feedbackTextarea}
                              rows={3}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button style={styles.submitFeedbackBtn} onClick={() => handleFeedback(order._id)}>Submit</button>
                              <button style={styles.cancelBtn} onClick={() => setShowFeedback(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button style={styles.feedbackBtn} onClick={() => setShowFeedback(order._id)}>
                            ★ Leave a Review
                          </button>
                        )}
                      </div>
                    )}

                    {order.feedback?.rating && (
                      <p style={styles.reviewedText}>◆ You rated this {'★'.repeat(order.feedback.rating)}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'track' && (
            <div style={styles.ordersSection}>
              {orders.map(order => (
                <div key={order._id} style={styles.trackCard}>
                  <div style={styles.trackHeader}>
                    <h3 style={styles.trackProduct}>{order.product?.name}</h3>
                    <p style={styles.trackId}>#{order.trackingId}</p>
                  </div>
                  <div style={styles.trackSteps} className="track-steps">
                    {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => {
                      const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
                      const currentIndex = steps.indexOf(order.orderStatus);
                      const isDone = index <= currentIndex;
                      return (
                        <div key={step} style={styles.trackStep}>
                          <div style={{ ...styles.trackDot, background: isDone ? '#C9A84C' : '#ddd' }} />
                          <p style={{ ...styles.trackStepLabel, color: isDone ? '#6B1B2A' : '#aaa' }}>{step}</p>
                          {index < 3 && (
                            <div style={{ ...styles.trackLine, background: isDone && index < currentIndex ? '#C9A84C' : '#ddd' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .profile-card {
            width: 240px !important;
            min-width: 240px !important;
          }
        }
        @media (max-width: 768px) {
          .track-steps {
            overflow-x: auto !important;
          }
          .order-top {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 16px',
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  profileCard: {
    width: '100%',
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '24px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  profileAvatar: {
    width: '80px', height: '80px', borderRadius: '50%', background: '#6B1B2A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '3px solid #C9A84C', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarLetter: { fontFamily: 'Cinzel, serif', fontSize: '28px', color: '#C9A84C' },
  profileName: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#6B1B2A', letterSpacing: '1px' },
  profileEmail: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888' },
  divider: { width: '60px', height: '1px', background: '#C9A84C' },
  logoutBtn: {
    background: 'transparent', border: '1px solid #6B1B2A', color: '#6B1B2A',
    padding: '8px 24px', fontFamily: 'Cinzel, serif', fontSize: '11px',
    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
  },
  mainContent: { flex: 1, minWidth: '280px' },
  tabs: { display: 'flex', borderBottom: '2px solid #F5ECD8', marginBottom: '24px' },
  tab: {
    background: 'transparent', border: 'none', padding: '12px 24px',
    fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px',
    cursor: 'pointer', color: '#888', textTransform: 'uppercase',
    borderBottom: '2px solid transparent', marginBottom: '-2px',
  },
  activeTab: { color: '#6B1B2A', borderBottom: '2px solid #6B1B2A' },
  ordersSection: { display: 'flex', flexDirection: 'column', gap: '16px' },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', textAlign: 'center', padding: '40px', letterSpacing: '2px' },
  emptyBox: { textAlign: 'center', padding: '60px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#6B1B2A', fontStyle: 'italic' },
  shopBtn: {
    background: '#6B1B2A', color: '#C9A84C', border: 'none', padding: '12px 32px',
    fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
  },
  orderCard: { background: '#fff', border: '1px solid #F5ECD8', padding: '20px' },
  orderTop: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  orderImg: { width: '80px', height: '80px', overflow: 'hidden', flexShrink: 0 },
  orderProductImg: { width: '100%', height: '100%', objectFit: 'cover' },
  orderInfo: { flex: 1 },
  orderProductName: { fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#6B1B2A', letterSpacing: '1px', marginBottom: '4px' },
  orderDetail: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888', marginBottom: '4px' },
  orderAmount: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#2C2C2C', marginBottom: '4px' },
  orderTracking: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px' },
  orderStatus: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  statusBadge: { fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1px', padding: '4px 12px', border: '1px solid', textTransform: 'uppercase' },
  orderDate: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa' },
  feedbackRow: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5ECD8' },
  feedbackBtn: {
    background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C',
    padding: '8px 20px', fontFamily: 'Cinzel, serif', fontSize: '11px',
    letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase',
  },
  feedbackForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  feedbackTitle: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px' },
  feedbackSelect: { padding: '8px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '13px', outline: 'none' },
  feedbackTextarea: { padding: '10px', border: '1px solid #C9A84C', fontFamily: 'Raleway, sans-serif', fontSize: '13px', outline: 'none', resize: 'vertical' },
  submitFeedbackBtn: {
    background: '#6B1B2A', color: '#C9A84C', border: 'none', padding: '10px 24px',
    fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer',
  },
  cancelBtn: { background: 'transparent', border: '1px solid #ddd', color: '#888', padding: '10px 24px', fontFamily: 'Raleway, sans-serif', fontSize: '12px', cursor: 'pointer' },
  reviewedText: { fontFamily: 'Raleway, sans-serif', fontSize: '13px', color: '#27AE60', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F5ECD8' },
  trackCard: { background: '#fff', border: '1px solid #F5ECD8', padding: '24px' },
  trackHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  trackProduct: { fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#6B1B2A', letterSpacing: '1px' },
  trackId: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#aaa', letterSpacing: '1px' },
  trackSteps: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trackStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
  trackDot: { width: '16px', height: '16px', borderRadius: '50%', marginBottom: '8px' },
  trackStepLabel: { fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' },
  trackLine: { position: 'absolute', top: '8px', left: '16px', width: '80px', height: '2px' },
};

export default Account;