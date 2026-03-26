import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await API.get('/orders/my');
      // Show only pending orders as cart
      const pending = data.filter(o => o.paymentStatus === 'Pending');
      setOrders(pending);
    } catch (err) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <Navbar cartCount={orders.length} />
      <div style={styles.page}>
        <h2 style={styles.title}>My Cart</h2>
        <div style={styles.divider} />

        {loading ? (
          <p style={styles.loadingText}>Loading cart...</p>
        ) : orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>Your cart is empty</p>
            <button style={styles.shopBtn} onClick={() => navigate('/')}>
              Browse Collection
            </button>
          </div>
        ) : (
          <div style={styles.cartLayout}>
            {/* Cart Items */}
            <div style={styles.cartItems}>
              {orders.map(order => (
                <div key={order._id} style={styles.cartCard}>
                  <img
                    src={`http://localhost:5000${order.product?.image}`}
                    alt={order.product?.name}
                    style={styles.cartImg}
                  />
                  <div style={styles.cartInfo}>
                    <h3 style={styles.cartProductName}>{order.product?.name}</h3>
                    <p style={styles.cartDetail}>
                      {order.product?.fabric} · {order.product?.colour}
                    </p>
                    <p style={styles.cartQty}>Qty: {order.quantity}</p>
                    <p style={styles.cartPrice}>₹{order.totalAmount?.toLocaleString()}</p>
                  </div>
                  <button
                    style={styles.buyNowBtn}
                    onClick={() => navigate(`/order/${order.product?._id}`)}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Items</span>
                <span style={styles.summaryValue}>{orders.length}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Total</span>
                <span style={styles.summaryTotal}>₹{totalAmount.toLocaleString()}</span>
              </div>
              <p style={styles.summaryNote}>
                Click "Buy Now" on any item to proceed to payment
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '60px 20px',
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Cinzel, serif',
    fontSize: '28px',
    color: '#6B1B2A',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  divider: {
    width: '80px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
    margin: '16px auto 40px',
  },
  loadingText: {
    fontFamily: 'Cinzel, serif',
    color: '#6B1B2A',
    letterSpacing: '2px',
    padding: '40px',
  },
  emptyBox: {
    padding: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  emptyText: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '28px',
    color: '#6B1B2A',
    fontStyle: 'italic',
  },
  shopBtn: {
    background: '#6B1B2A',
    color: '#C9A84C',
    border: '1px solid #C9A84C',
    padding: '14px 40px',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  cartLayout: {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  cartItems: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cartCard: {
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '20px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  cartImg: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  cartInfo: { flex: 1 },
  cartProductName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '15px',
    color: '#6B1B2A',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  cartDetail: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  cartQty: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#555',
    marginBottom: '6px',
  },
  cartPrice: {
    fontFamily: 'Cinzel, serif',
    fontSize: '18px',
    color: '#2C2C2C',
  },
  buyNowBtn: {
    background: '#6B1B2A',
    color: '#C9A84C',
    border: 'none',
    padding: '10px 20px',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  summary: {
    width: '280px',
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '24px',
    position: 'sticky',
    top: '100px',
  },
  summaryTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '16px',
    color: '#6B1B2A',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  summaryDivider: {
    height: '1px',
    background: '#F5ECD8',
    marginBottom: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
    letterSpacing: '1px',
  },
  summaryValue: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#2C2C2C',
  },
  summaryTotal: {
    fontFamily: 'Cinzel, serif',
    fontSize: '18px',
    color: '#6B1B2A',
  },
  summaryNote: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '11px',
    color: '#aaa',
    marginTop: '16px',
    lineHeight: 1.6,
    letterSpacing: '0.5px',
  },
};

export default Cart;