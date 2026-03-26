import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const OrderPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    quantity: 1
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${productId}`);
      setProduct(data);
    } catch (err) {
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = product ? product.price * form.quantity : 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async () => {
    if (!form.customerPhone) {
      toast.error('Please enter your phone number');
      return;
    }
    setPlacing(true);
    try {
      const { data: order } = await API.post('/orders', {
        productId,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        quantity: Number(form.quantity)
      });

      // For now with dummy Razorpay — show success directly
      toast.success('Order placed! Redirecting to payment...');

      // When real Razorpay keys are added, replace below with actual Razorpay flow
      setTimeout(() => {
        toast.success('🎉 Order confirmed! Check your email.');
        navigate('/account');
      }, 2000);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>Complete Your Order</h2>
        <div style={styles.divider} />

        <div style={styles.layout}>
          {/* Product Preview */}
          <div style={styles.productCard}>
            <img
              src={`http://localhost:5000${product?.image}`}
              alt={product?.name}
              style={styles.productImg}
            />
            <div style={styles.productInfo}>
              <h3 style={styles.productName}>{product?.name}</h3>
              <p style={styles.productDetail}>{product?.fabric} · {product?.colour}</p>
              <p style={styles.productPattern}>{product?.pattern}</p>
              <p style={styles.productPrice}>₹{product?.price?.toLocaleString()} per saree</p>
              <p style={styles.productStock}>{product?.stock} in stock</p>
            </div>
          </div>

          {/* Order Form */}
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Order Details</h3>

            <div style={styles.field}>
              <label>Full Name</label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div style={styles.field}>
              <label>Email Address</label>
              <input
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                placeholder="your@email.com"
                type="email"
              />
            </div>

            <div style={styles.field}>
              <label>Phone Number</label>
              <input
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                type="tel"
              />
            </div>

            <div style={styles.field}>
              <label>Quantity</label>
              <select
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                style={styles.select}
              >
                {[...Array(Math.min(product?.stock || 1, 5))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div style={styles.summaryBox}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Price per saree</span>
                <span style={styles.summaryValue}>₹{product?.price?.toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Quantity</span>
                <span style={styles.summaryValue}>{form.quantity}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={styles.totalLabel}>Total Amount</span>
                <span style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              style={styles.payBtn}
              onClick={handleOrder}
              disabled={placing}
            >
              {placing ? 'Processing...' : `Proceed to Pay ₹${totalAmount.toLocaleString()}`}
            </button>

            <p style={styles.secureNote}>
              🔒 Secure payment powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loadingPage: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Cinzel, serif',
    color: '#6B1B2A',
    letterSpacing: '3px',
  },
  page: {
    maxWidth: '1000px',
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
  layout: {
    display: 'flex',
    gap: '32px',
    textAlign: 'left',
  },
  productCard: {
    width: '320px',
    minWidth: '320px',
    background: '#fff',
    border: '1px solid #F5ECD8',
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
  },
  productInfo: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  productName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '16px',
    color: '#6B1B2A',
    letterSpacing: '1px',
  },
  productDetail: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#888',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  productPattern: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic',
  },
  productPrice: {
    fontFamily: 'Cinzel, serif',
    fontSize: '20px',
    color: '#6B1B2A',
  },
  productStock: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '11px',
    color: '#aaa',
    letterSpacing: '1px',
  },
  formCard: {
    flex: 1,
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '18px',
    color: '#6B1B2A',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #C9A84C',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '14px',
    color: '#2C2C2C',
    outline: 'none',
    background: '#fff',
  },
  summaryBox: {
    background: '#FDF6EC',
    border: '1px solid #F5ECD8',
    padding: '20px',
    marginTop: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  summaryLabel: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
  },
  summaryValue: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#2C2C2C',
  },
  summaryDivider: {
    height: '1px',
    background: '#E2C97E',
    margin: '12px 0',
  },
  totalLabel: {
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    color: '#6B1B2A',
    letterSpacing: '1px',
  },
  totalAmount: {
    fontFamily: 'Cinzel, serif',
    fontSize: '22px',
    color: '#6B1B2A',
  },
  payBtn: {
    background: '#6B1B2A',
    color: '#C9A84C',
    border: '1px solid #C9A84C',
    padding: '16px',
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    marginTop: '8px',
  },
  secureNote: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#aaa',
    textAlign: 'center',
    letterSpacing: '1px',
  },
};

export default OrderPage;