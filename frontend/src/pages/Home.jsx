import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ fabric: '', colour: '', minPrice: '', maxPrice: '' });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const fetchProducts = async () => {
    try {
      const params = {};
      if (filters.fabric) params.fabric = filters.fabric;
      if (filters.colour) params.colour = filters.colour;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      const { data } = await API.get('/products', { params });
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('varneekaCart') || '[]');
    setCartCount(cart.length);
  };

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => fetchProducts();

  const clearFilters = () => {
    setFilters({ fabric: '', colour: '', minPrice: '', maxPrice: '' });
    setTimeout(() => fetchProducts(), 100);
  };

  const handleAddToCart = (productId) => {
    if (!user) { navigate('/login'); return; }

    const cart = JSON.parse(localStorage.getItem('varneekaCart') || '[]');
    const exists = cart.find(item => item.productId === productId);

    if (exists) {
      toast.error('Already in cart!');
      return;
    }

    cart.push({ productId, addedAt: Date.now() });
    localStorage.setItem('varneekaCart', JSON.stringify(cart));
    setCartCount(cart.length);
    toast.success('Added to cart!');
  };

  const handleBuyNow = (productId) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/order/${productId}`);
  };

  return (
    <div>
      <Navbar cartCount={cartCount} />

      {/* ───── HERO SECTION ───── */}
      <div style={styles.hero}>
        <img src="/home_background.png" alt="" style={styles.heroBg} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.logoWrapper}>
            <img src="/logo.svg" alt="The Varneeka Woman Logo" style={styles.heroLogo} />
          </div>
          <h1 style={styles.heroTitle}>THE VARNEEKA WOMAN</h1>
          <div style={styles.heroDivider} />
          <p style={styles.heroBy}>𝒷𝓎 𝓒𝓪𝓹𝓽 𝓐𝓭𝓲𝓽𝓲 𝓢𝓪𝓶𝓪𝓷𝓽</p>
          <p style={styles.heroTagline}>Thoughtfully Curated Handloom Sarees</p>
          <button
            style={styles.heroBtn}
            onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Collection
          </button>
        </div>
      </div>

      {/* ───── COLLECTION SECTION ───── */}
      <div id="collection" style={styles.collectionSection}>
        <h2 className="section-title">Our Collection</h2>
        <div className="divider" />

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label>Fabric</label>
            <select name="fabric" value={filters.fabric} onChange={handleFilter} style={styles.select}>
              <option value="">All Fabrics</option>
              <option value="Silk">Silk</option>
              <option value="Cotton">Cotton</option>
              <option value="Chiffon">Chiffon</option>
              <option value="Georgette">Georgette</option>
              <option value="Linen">Linen</option>
              <option value="Banarasi">Banarasi</option>
              <option value="Kanjivaram">Kanjivaram</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label>Colour</label>
            <input name="colour" value={filters.colour} onChange={handleFilter} placeholder="e.g. Red" style={styles.input} />
          </div>
          <div style={styles.filterGroup}>
            <label>Min Price (₹)</label>
            <input name="minPrice" value={filters.minPrice} onChange={handleFilter} placeholder="0" type="number" style={styles.input} />
          </div>
          <div style={styles.filterGroup}>
            <label>Max Price (₹)</label>
            <input name="maxPrice" value={filters.maxPrice} onChange={handleFilter} placeholder="50000" type="number" style={styles.input} />
          </div>
          <div style={styles.filterBtns}>
            <button className="btn-primary" onClick={applyFilters}>Apply</button>
            <button className="btn-outline" onClick={clearFilters}>Clear</button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.loadingSpinner} />
            <p style={styles.loadingText}>Loading collection...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No sarees found</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product, index) => (
              <div
                key={product._id}
                style={{ ...styles.card, animationDelay: `${index * 0.1}s` }}
                className="fade-in"
              >
                <div style={styles.cardCircle} />
                <div style={styles.imageWrapper} onClick={() => navigate(`/product/${product._id}`)}>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    style={{ ...styles.productImg, cursor: 'pointer' }}
                  />
                  {product.stock === 0 && (
                    <div style={styles.outOfStock}>Out of Stock</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productDetail}>{product.fabric} · {product.colour}</p>
                  <p style={styles.productPattern}>{product.pattern}</p>
                  {product.numReviews > 0 && (
                    <p style={styles.rating}>
                      {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
                      <span style={styles.ratingCount}> ({product.numReviews})</span>
                    </p>
                  )}
                  <p style={styles.price}>₹{product.price.toLocaleString()}</p>
                  <p style={styles.stock}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </p>
                  {product.stock > 0 && (
                    <div style={styles.cardBtns}>
                      <button style={styles.cartBtn} onClick={() => handleAddToCart(product._id)}>
                        Add to Cart
                      </button>
                      <button style={styles.buyBtn} onClick={() => handleBuyNow(product._id)}>
                        Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ───── ABOUT SECTION ───── */}
      <div id="about" style={styles.aboutSection}>
        <div style={styles.aboutContent}>
          <h2 className="section-title" style={{ color: '#C9A84C' }}>About Us</h2>
          <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px auto' }} />
          <p style={styles.aboutText}>
            The Varneeka Woman is a celebration of India's rich handloom heritage.
            Each saree in our collection is thoughtfully curated by Capt Aditi Samant —
            chosen for its craftsmanship, authenticity, and timeless elegance.
          </p>
          <p style={styles.aboutText}>
            We believe every woman deserves to drape herself in art.
            Our sarees tell stories of skilled weavers, ancient traditions,
            and the enduring beauty of Indian textile culture.
          </p>
        </div>
      </div>

      {/* ───── CONTACT SECTION ───── */}
      <div id="contact" style={styles.contactSection}>
        <h2 className="section-title"><b>Contact Us</b></h2>
        <div className="divider" />
        <p style={styles.contactSubtitle}><b>We'd love to hear from you!</b></p>
        <div style={styles.contactGrid}>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="12" fill="#6B1B2A"/>
                <path d="M4 8l8 5 8-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="4" y="7" width="16" height="11" rx="2" stroke="#C9A84C" strokeWidth="1.5"/>
              </svg>
            </div>
            <p style={styles.contactCardTitle}>Email Us</p>
            <a href="mailto:alexshah8168911@gmail.com" style={styles.contactCardValue}>
              alexshah8168911@gmail.com
            </a>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="12" fill="#6B1B2A"/>
                <path d="M6.5 4h3l1.5 4-2 1.5c1 2 2.5 3.5 4.5 4.5L15 12l4 1.5v3C19 17.5 16 19 12 16 8 13 5 9 6.5 4z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={styles.contactCardTitle}>Call Us</p>
            <p style={styles.contactCardValue}>+91 XXXXX XXXXX</p>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="12" fill="#6B1B2A"/>
                <rect x="5" y="5" width="14" height="14" rx="4" stroke="#C9A84C" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3.5" stroke="#C9A84C" strokeWidth="1.5"/>
                <circle cx="16.5" cy="7.5" r="1" fill="#C9A84C"/>
              </svg>
            </div>
            <p style={styles.contactCardTitle}>Instagram</p>
            <a href="https://instagram.com" target="_blank" style={styles.contactCardValue}>
              @thevarneeka_woman
            </a>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="12" fill="#6B1B2A"/>
                <path d="M12 4C7.6 4 4 7.6 4 12c0 1.5.4 2.9 1.1 4.1L4 20l4-1.1C9.1 19.6 10.5 20 12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={styles.contactCardTitle}>WhatsApp</p>
            <a href="https://wa.me/91XXXXXXXXXX" target="_blank" style={styles.contactCardValue}>
              Chat with us
            </a>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="12" fill="#6B1B2A"/>
                <path d="M12 4C9.2 4 7 6.2 7 9c0 4 5 11 5 11s5-7 5-11c0-2.8-2.2-5-5-5z" stroke="#C9A84C" strokeWidth="1.5"/>
                <circle cx="12" cy="9" r="2" stroke="#C9A84C" strokeWidth="1.5"/>
              </svg>
            </div>
            <p style={styles.contactCardTitle}>Location</p>
            <p style={styles.contactCardValue}>India</p>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="12" fill="#6B1B2A"/>
                <path d="M13 10h3l-.5 3H13v7h-3v-7H8v-3h2V8.5C10 6.5 11 5 13.5 5H16v3h-1.5c-.8 0-1 .3-1 1V10z" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={styles.contactCardTitle}>Facebook</p>
            <a href="https://facebook.com" target="_blank" style={styles.contactCardValue}>
              The Varneeka Woman
            </a>
          </div>
        </div>
      </div>

      {/* ───── FOOTER ───── */}
      <footer style={styles.footer}>
        <img src="/logo.svg" alt="" style={styles.footerLogo} />
        <p style={styles.footerBrand}>THE VARNEEKA WOMAN</p>
        <p style={styles.footerTagline}>by Capt Aditi Samant</p>
        <div style={styles.footerLinks}>
          <a href="/" style={styles.footerLink}>Home</a>
          <a href="#about" style={styles.footerLink}>About</a>
          <a href="#contact" style={styles.footerLink}>Contact</a>
        </div>
        <p style={styles.footerCopy}>© 2025 The Varneeka Woman. All Rights Reserved.</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(201,168,76,0.5)); }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 24px rgba(201,168,76,0.8)); }
        }
        .fade-in { animation: fadeIn 0.6s ease both; }
        .section-title {
          font-family: 'Cinzel', serif;
          font-size: clamp(20px, 4vw, 36px);
          color: #6B1B2A;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .divider {
          width: 80px;
          height: 2px;
          background: linear-gradient(to right, transparent, #C9A84C, transparent);
          margin: 0 auto 32px;
        }
        .btn-primary {
          background: #6B1B2A;
          color: #C9A84C;
          border: none;
          padding: 10px 24px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 2px;
          cursor: pointer;
          text-transform: uppercase;
        }
        .btn-outline {
          background: transparent;
          color: #6B1B2A;
          border: 1px solid #6B1B2A;
          padding: 10px 24px;
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 2px;
          cursor: pointer;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          #collection { padding: 40px 16px !important; }
          .fade-in { animation-delay: 0s !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  hero: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    textAlign: 'center',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    zIndex: 0,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(42, 8, 14, 0.62)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
    padding: '60px 20px',
  },
  logoWrapper: { marginBottom: '8px' },
  heroLogo: {
    width: '250px',
    height: '250px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1) sepia(1) saturate(4) hue-rotate(5deg)',
    animation: 'logoPulse 4s ease-in-out infinite',
  },
  heroTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: 'clamp(26px, 5vw, 64px)',
    color: '#C9A84C',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    animation: 'heroReveal 1s ease 0.3s both',
  },
  heroDivider: {
    width: '120px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
    animation: 'heroReveal 1s ease 0.6s both',
  },
  heroBy: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '30px',
    color: '#E2C97E',
    letterSpacing: '4px',
    animation: 'heroReveal 1s ease 0.8s both',
  },
  heroTagline: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '30px',
    color: '#FDF6EC',
    letterSpacing: '3px',
    fontStyle: 'italic',
    animation: 'heroReveal 1s ease 1s both',
  },
  heroBtn: {
    background: 'transparent',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    padding: '14px 44px',
    fontFamily: 'Cinzel, serif',
    fontSize: '18px',
    letterSpacing: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
    marginTop: '8px',
    animation: 'heroReveal 1s ease 1.2s both',
  },
  collectionSection: {
    padding: '60px 16px',
    maxWidth: '1300px',
    margin: '0 auto',
    textAlign: 'center',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    margin: '24px 0',
    padding: '16px',
    background: '#fff',
    border: '1px solid #E2C97E',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '150px',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #C9A84C',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#2C2C2C',
    background: '#fff',
    outline: 'none',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #C9A84C',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#2C2C2C',
    outline: 'none',
  },
  filterBtns: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '80px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E2C97E',
    borderTop: '3px solid #6B1B2A',
    borderRadius: '50%',
    animation: 'rotate 1s linear infinite',
  },
  loadingText: {
    fontFamily: 'Cinzel, serif',
    color: '#6B1B2A',
    letterSpacing: '2px',
  },
  empty: { padding: '80px', textAlign: 'center' },
  emptyText: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '24px',
    color: '#6B1B2A',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    marginTop: '40px',
  },
  card: {
    background: '#fff',
    border: '1px solid #F5ECD8',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s',
    textAlign: 'center',
  },
  cardCircle: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '1px solid rgba(201, 168, 76, 0.15)',
    top: '-50px',
    right: '-50px',
    pointerEvents: 'none',
  },
  imageWrapper: {
    position: 'relative',
    height: '320px',
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  outOfStock: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: '#6B1B2A',
    color: '#C9A84C',
    padding: '4px 12px',
    fontSize: '11px',
    fontFamily: 'Cinzel, serif',
    letterSpacing: '1px',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  productName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '15px',
    color: '#6B1B2A',
    letterSpacing: '1px',
  },
  productDetail: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#555',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  productPattern: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic',
  },
  rating: { color: '#C9A84C', fontSize: '14px' },
  ratingCount: { color: '#888', fontSize: '12px' },
  price: {
    fontFamily: 'Cinzel, serif',
    fontSize: '18px',
    color: '#6B1B2A',
    fontWeight: '600',
  },
  stock: {
    fontSize: '11px',
    color: '#888',
    letterSpacing: '1px',
    fontFamily: 'Raleway, sans-serif',
  },
  cardBtns: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  cartBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid #6B1B2A',
    color: '#6B1B2A',
    padding: '10px',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
  },
  buyBtn: {
    flex: 1,
    background: '#6B1B2A',
    border: '1px solid #6B1B2A',
    color: '#C9A84C',
    padding: '10px',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
  },
  aboutSection: {
    background: '#6B1B2A',
    padding: '60px 20px',
    textAlign: 'center',
  },
  aboutContent: {
    maxWidth: '700px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  aboutText: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '18px',
    color: '#FDF6EC',
    lineHeight: 1.8,
    fontStyle: 'italic',
  },
  contactSection: {
    padding: '60px 20px',
    textAlign: 'center',
    background: '#FDF6EC',
  },
  contactSubtitle: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '18px',
    color: '#888',
    fontStyle: 'italic',
    letterSpacing: '2px',
    marginBottom: '40px',
    textAlign: 'center',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  contactCard: {
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '32px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'box-shadow 0.3s',
  },
  contactIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#FDF6EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #E2C97E',
  },
  contactCardTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    color: '#6B1B2A',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  contactCardValue: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#555',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    lineHeight: 1.4,
  },
  footer: {
    background: '#2C2C2C',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  footerLogo: {
    height: '44px',
    width: '44px',
    objectFit: 'contain',
    opacity: 0.6,
    filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg)',
  },
  footerBrand: {
    fontFamily: 'Cinzel, serif',
    fontSize: '16px',
    color: '#C9A84C',
    letterSpacing: '4px',
  },
  footerTagline: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '14px',
    color: '#888',
    fontStyle: 'italic',
  },
  footerLinks: { display: 'flex', gap: '24px' },
  footerLink: {
    color: '#FDF6EC',
    textDecoration: 'none',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  footerCopy: {
    color: '#555',
    fontSize: '12px',
    fontFamily: 'Raleway, sans-serif',
  },
};

export default Home;