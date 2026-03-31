import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API, { getImageUrl } from '../utils/api';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartProducts();
  }, []);

  const fetchCartProducts = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('varneekaCart') || '[]');
      if (cart.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all products
      const { data } = await API.get('/products');
      const cartProducts = cart.map(item => {
        const product = data.find(p => p._id === item.productId);
        return { ...item, product };
      }).filter(item => item.product);

      setCartItems(cartProducts);
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId) => {
    const cart = JSON.parse(localStorage.getItem('varneekaCart') || '[]');
    const updated = cart.filter(item => item.productId !== productId);
    localStorage.setItem('varneekaCart', JSON.stringify(updated));
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    toast.success('Removed from cart');
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);

  return (
    <div>
      <Navbar cartCount={cartItems.length} />
      <div style={styles.page}>
        <h2 style={styles.title}>My Cart</h2>
        <div style={styles.divider} />

        {loading ? (
          <p style={styles.loadingText}>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>Your cart is empty</p>
            <button style={styles.shopBtn} onClick={() => navigate('/')}>
              Browse Collection
            </button>
          </div>
        ) : (
          <div style={styles.cartLayout}>
            <div style={styles.cartItems}>
              {cartItems.map(item => (
                <div key={item.productId} style={styles.cartCard}>
                  <img
                    src={getImageUrl(item.product?.image)}
                    alt={item.product?.name}
                    style={styles.cartImg}
                  />
                  <div style={styles.cartInfo}>
                    <h3 style={styles.cartProductName}>{item.product?.name}</h3>
                    <p style={styles.cartDetail}>
                      {item.product?.fabric} · {item.product?.colour}
                    </p>
                    <p style={styles.cartPrice}>₹{item.product?.price?.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button
                      style={styles.buyNowBtn}
                      onClick={() => navigate(`/order/${item.productId}`)}
                    >
                      Buy Now
                    </button>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Items</span>
                <span style={styles.summaryValue}>{cartItems.length}</span>
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
    flexWrap: 'wrap',
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
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid #E74C3C',
    color: '#E74C3C',
    padding: '8px 20px',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  summary: {
    width: '280px',
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '24px',
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