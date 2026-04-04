import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API, { getImageUrl } from '../utils/api';

const HAPPY_CUSTOMERS = [
  { name: 'Priya Sharma', rating: 5, comment: 'Absolutely stunning saree! The fabric quality is exceptional and the colours are exactly as shown.' },
  { name: 'Anita Mehta', rating: 5, comment: 'Loved my purchase! Capt Aditi has such an eye for beautiful handloom pieces. Will definitely order again.' },
  { name: 'Rekha Nair', rating: 5, comment: 'The saree arrived beautifully packed. Exquisite craftsmanship and truly a timeless piece.' },
  { name: 'Sunita Patel', rating: 5, comment: 'Perfect for my daughter\'s wedding. Everyone complimented the saree. Thank you so much!' },
  { name: 'Meera Joshi', rating: 5, comment: 'Authentic handloom quality, rich texture. Exactly what I was looking for. Highly recommended!' },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('varneekaWishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewTimer = useRef(null);
  const [heroScrolled, setHeroScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setHeroScrolled(heroBottom < 60);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    reviewTimer.current = setInterval(() => {
      setReviewIndex(prev => (prev + 1) % HAPPY_CUSTOMERS.length);
    }, 3000);
    return () => clearInterval(reviewTimer.current);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products', { params: {} });
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

  const handleAddToCart = (productId) => {
    if (!user) { navigate('/login'); return; }
    const cart = JSON.parse(localStorage.getItem('varneekaCart') || '[]');
    const exists = cart.find(item => item.productId === productId);
    if (exists) { toast.error('Already in cart!'); return; }
    cart.push({ productId, addedAt: Date.now() });
    localStorage.setItem('varneekaCart', JSON.stringify(cart));
    setCartCount(cart.length);
    toast.success('Added to cart!');
  };

  const handleBuyNow = (productId) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/order/${productId}`);
  };

  const toggleWishlist = (productId) => {
    if (!user) { navigate('/login'); return; }
    const updated = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    localStorage.setItem('varneekaWishlist', JSON.stringify(updated));
    toast.success(wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div>
      <Navbar cartCount={cartCount} heroScrolled={heroScrolled} />

      {/* ───── HERO SECTION ───── */}
      <div style={styles.hero} ref={heroRef}>
        <img src="/home_background.png" alt="" style={styles.heroBg} />
        <div style={styles.heroOverlay} />

        {/* DESKTOP hero content */}
        <div style={styles.heroContent} className="hero-desktop">
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

        {/* CHANGE 8 — Mobile hero updated style + opacity on scroll */}
        <div style={{
          ...styles.heroMobile,
          opacity: heroScrolled ? 0 : 1,
          transition: 'opacity 0.4s ease',
        }} className="hero-mobile">
          <img src="/logo.svg" alt="logo" style={styles.heroMobileLogo} />
          <div style={styles.heroMobileText}>
            <p style={styles.heroMobileTitle}><b>THE VARNEEKA WOMAN</b></p>
            <p style={styles.heroMobileBy}>𝒷𝓎 𝓒𝓪𝓹𝓽 𝓐𝓭𝓲𝓽𝓲 𝓢𝓪𝓶𝓪𝓷𝓽</p>
            <p style={styles.heroMobileTagline}>Thoughtfully Curated Handloom Sarees</p>
          </div>
          <button
            style={styles.heroMobileBtn}
            onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
          >
            Shop
          </button>
        </div>
      </div>

      {/* ───── CHANGE 7: COLLECTION SECTION — grouped horizontal scroll ───── */}
      <div id="collection" style={styles.collectionSection}>
        <h2 className="section-title">Our Collection</h2>
        <div className="divider" />

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.loadingSpinner} />
            <p style={styles.loadingText}>Loading collection...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No sarees found</p>
          </div>
        ) : (() => {
          const untagged = products.filter(p => !p.tag || p.tag === '');
          const newArrivals = products.filter(p => p.tag === 'new_arrival');
          const bestSelling = products.filter(p => p.tag === 'best_selling');

          const groupedByName = untagged.reduce((acc, product) => {
            const key = product.name;
            if (!acc[key]) acc[key] = [];
            acc[key].push(product);
            return acc;
          }, {});

          return (
            <div>
              {/* Our Collection — grouped by name */}
              {Object.keys(groupedByName).map(name => (
                <div key={name} style={styles.sectionGroup}>
                  <h3 style={styles.groupTitle}>{name}</h3>
                  <div style={styles.horizontalRow} className="horizontal-row">
                    {groupedByName[name].map(product => (
                      <div key={product._id} style={styles.card} className="product-card">
                        <div style={styles.imageWrapper}>
                          <button
                            style={{
                              ...styles.wishlistBtn,
                              color: wishlist.includes(product._id) ? '#E74C3C' : '#aaa',
                            }}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                          >
                            {wishlist.includes(product._id) ? '♥' : '♡'}
                          </button>
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={styles.productImg}
                            onClick={() => navigate(`/product/${product._id}`)}
                          />
                          {product.stock === 0 && <div style={styles.outOfStock}>Out of Stock</div>}
                        </div>
                        <div style={styles.cardBody}>
                          <p style={styles.productDetail}>{product.fabric} · {product.colour}</p>
                          <p style={styles.price}>₹{product.price.toLocaleString()}</p>
                          {product.stock > 0 && (
                            <div style={styles.cardBtns}>
                              <button style={styles.cartBtn} onClick={() => handleAddToCart(product._id)}>Cart</button>
                              <button style={styles.buyBtn} onClick={() => handleBuyNow(product._id)}>Buy</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* New Arrivals section */}
              {newArrivals.length > 0 && (
                <div style={styles.sectionGroup}>
                  <h3 style={{ ...styles.groupTitle, color: '#6B1B2A' }}>✦ New Arrivals</h3>
                  <div style={styles.horizontalRow} className="horizontal-row">
                    {newArrivals.map(product => (
                      <div key={product._id} style={styles.card} className="product-card">
                        <div style={styles.imageWrapper}>
                          <div style={styles.tagBadge}>New Arrival</div>
                          <button
                            style={{
                              ...styles.wishlistBtn,
                              color: wishlist.includes(product._id) ? '#E74C3C' : '#aaa',
                            }}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                          >
                            {wishlist.includes(product._id) ? '♥' : '♡'}
                          </button>
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={styles.productImg}
                            onClick={() => navigate(`/product/${product._id}`)}
                          />
                          {product.stock === 0 && <div style={styles.outOfStock}>Out of Stock</div>}
                        </div>
                        <div style={styles.cardBody}>
                          <p style={styles.productName}>{product.name}</p>
                          <p style={styles.productDetail}>{product.fabric} · {product.colour}</p>
                          <p style={styles.price}>₹{product.price.toLocaleString()}</p>
                          {product.stock > 0 && (
                            <div style={styles.cardBtns}>
                              <button style={styles.cartBtn} onClick={() => handleAddToCart(product._id)}>Cart</button>
                              <button style={styles.buyBtn} onClick={() => handleBuyNow(product._id)}>Buy</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Selling section */}
              {bestSelling.length > 0 && (
                <div style={styles.sectionGroup}>
                  <h3 style={{ ...styles.groupTitle, color: '#C9A84C' }}>✦ Best Selling</h3>
                  <div style={styles.horizontalRow} className="horizontal-row">
                    {bestSelling.map(product => (
                      <div key={product._id} style={styles.card} className="product-card">
                        <div style={styles.imageWrapper}>
                          <div style={{ ...styles.tagBadge, background: '#C9A84C', color: '#6B1B2A' }}>Best Selling</div>
                          <button
                            style={{
                              ...styles.wishlistBtn,
                              color: wishlist.includes(product._id) ? '#E74C3C' : '#aaa',
                            }}
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                          >
                            {wishlist.includes(product._id) ? '♥' : '♡'}
                          </button>
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            style={styles.productImg}
                            onClick={() => navigate(`/product/${product._id}`)}
                          />
                          {product.stock === 0 && <div style={styles.outOfStock}>Out of Stock</div>}
                        </div>
                        <div style={styles.cardBody}>
                          <p style={styles.productName}>{product.name}</p>
                          <p style={styles.productDetail}>{product.fabric} · {product.colour}</p>
                          <p style={styles.price}>₹{product.price.toLocaleString()}</p>
                          {product.stock > 0 && (
                            <div style={styles.cardBtns}>
                              <button style={styles.cartBtn} onClick={() => handleAddToCart(product._id)}>Cart</button>
                              <button style={styles.buyBtn} onClick={() => handleBuyNow(product._id)}>Buy</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ───── HAPPY CUSTOMERS SECTION ───── */}
      <div style={styles.reviewSection}>
        <h2 className="section-title" style={{ color: '#C9A84C' }}>Happy Customers</h2>
        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px auto 32px' }} />
        <div style={styles.reviewSlider}>
          <button style={styles.reviewArrow} onClick={() => setReviewIndex(prev => (prev - 1 + HAPPY_CUSTOMERS.length) % HAPPY_CUSTOMERS.length)}>‹</button>
          <div style={styles.reviewCard}>
            <p style={styles.reviewStars}>{renderStars(HAPPY_CUSTOMERS[reviewIndex].rating)}</p>
            <p style={styles.reviewComment}>"{HAPPY_CUSTOMERS[reviewIndex].comment}"</p>
            <p style={styles.reviewName}>— {HAPPY_CUSTOMERS[reviewIndex].name}</p>
          </div>
          <button style={styles.reviewArrow} onClick={() => setReviewIndex(prev => (prev + 1) % HAPPY_CUSTOMERS.length)}>›</button>
        </div>
        <div style={styles.reviewDots}>
          {HAPPY_CUSTOMERS.map((_, i) => (
            <button key={i} style={{ ...styles.reviewDot, background: i === reviewIndex ? '#C9A84C' : 'rgba(201,168,76,0.3)' }} onClick={() => setReviewIndex(i)} />
          ))}
        </div>
      </div>

      {/* ───── ABOUT SECTION ───── */}
      <div id="about" style={styles.aboutSection}>
        <div style={styles.aboutContent}>
          <h2 className="section-title" style={{ color: '#C9A84C' }}>About Us</h2>
          <div style={{ width: '80px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', margin: '16px auto' }} />
          <p style={styles.aboutText}>The Varneeka Woman is a celebration of India's rich handloom heritage. Each saree in our collection is thoughtfully curated by Capt Aditi Samant — chosen for its craftsmanship, authenticity, and timeless elegance.</p>
          <p style={styles.aboutText}>We believe every woman deserves to drape herself in art. Our sarees tell stories of skilled weavers, ancient traditions, and the enduring beauty of Indian textile culture.</p>
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#6B1B2A"/><path d="M4 8l8 5 8-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/><rect x="4" y="7" width="16" height="11" rx="2" stroke="#C9A84C" strokeWidth="1.5"/></svg>
            </div>
            <p style={styles.contactCardTitle}>Email Us</p>
            <a href="mailto:alexshah8168911@gmail.com" style={styles.contactCardValue}>alexshah8168911@gmail.com</a>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#6B1B2A"/><path d="M6.5 4h3l1.5 4-2 1.5c1 2 2.5 3.5 4.5 4.5L15 12l4 1.5v3C19 17.5 16 19 12 16 8 13 5 9 6.5 4z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p style={styles.contactCardTitle}>Call Us</p>
            <p style={styles.contactCardValue}>+91 XXXXX XXXXX</p>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#6B1B2A"/><rect x="5" y="5" width="14" height="14" rx="4" stroke="#C9A84C" strokeWidth="1.5"/><circle cx="12" cy="12" r="3.5" stroke="#C9A84C" strokeWidth="1.5"/><circle cx="16.5" cy="7.5" r="1" fill="#C9A84C"/></svg>
            </div>
            <p style={styles.contactCardTitle}>Instagram</p>
            <a href="https://instagram.com" target="_blank" style={styles.contactCardValue}>@thevarneeka_woman</a>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#6B1B2A"/><path d="M12 4C7.6 4 4 7.6 4 12c0 1.5.4 2.9 1.1 4.1L4 20l4-1.1C9.1 19.6 10.5 20 12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p style={styles.contactCardTitle}>WhatsApp</p>
            <a href="https://wa.me/91XXXXXXXXXX" target="_blank" style={styles.contactCardValue}>Chat with us</a>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#6B1B2A"/><path d="M12 4C9.2 4 7 6.2 7 9c0 4 5 11 5 11s5-7 5-11c0-2.8-2.2-5-5-5z" stroke="#C9A84C" strokeWidth="1.5"/><circle cx="12" cy="9" r="2" stroke="#C9A84C" strokeWidth="1.5"/></svg>
            </div>
            <p style={styles.contactCardTitle}>Location</p>
            <p style={styles.contactCardValue}>India</p>
          </div>
          <div style={styles.contactCard}>
            <div style={styles.contactIconBox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#6B1B2A"/><path d="M13 10h3l-.5 3H13v7h-3v-7H8v-3h2V8.5C10 6.5 11 5 13.5 5H16v3h-1.5c-.8 0-1 .3-1 1V10z" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            </div>
            <p style={styles.contactCardTitle}>Facebook</p>
            <a href="https://facebook.com" target="_blank" style={styles.contactCardValue}>The Varneeka Woman</a>
          </div>
        </div>
      </div>

      {/* ───── FOOTER ───── */}
      <footer style={styles.footer}>
        <img src="/logo.svg" alt="" style={styles.footerLogo} />
        <p style={styles.footerBrand}>THE VARNEEKA WOMAN</p>
        <p style={styles.footerTagline}>𝒷𝓎 𝓒𝓪𝓹𝓽 𝓐𝓭𝓲𝓽𝓲 𝓢𝓪𝓶𝓪𝓷𝓽</p>
        <div style={styles.footerLinks}>
          <a href="/" style={styles.footerLink}>Home</a>
          <a href="#about" style={styles.footerLink}>About</a>
          <a href="#contact" style={styles.footerLink}>Contact</a>
        </div>
        <p style={styles.footerCopy}>© 2025 The Varneeka Woman. All Rights Reserved.</p>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes heroReveal { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(201,168,76,0.5)); }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 24px rgba(201,168,76,0.8)); }
        }
        .fade-in { animation: fadeIn 0.6s ease both; }
        .section-title { font-family: 'Cinzel', serif; font-size: clamp(20px, 4vw, 36px); color: #6B1B2A; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px; }
        .divider { width: 80px; height: 2px; background: linear-gradient(to right, transparent, #C9A84C, transparent); margin: 0 auto 32px; }
        .btn-primary { background: #6B1B2A; color: #C9A84C; border: none; padding: 10px 24px; font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; cursor: pointer; text-transform: uppercase; }
        .btn-outline { background: transparent; color: #6B1B2A; border: 1px solid #6B1B2A; padding: 10px 24px; font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; cursor: pointer; text-transform: uppercase; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(107,27,42,0.12); }
        .product-card:hover img { transform: scale(1.04); }
        .horizontal-row::-webkit-scrollbar { display: none; }
        .hero-desktop { display: flex; }
        .hero-mobile { display: none; }
        @media (max-width: 768px) {
          .hero-desktop { display: none !important; }
          .hero-mobile { display: flex !important; }
          #collection { padding: 24px 12px !important; }
          .fade-in { animation-delay: 0s !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  hero: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textAlign: 'center', minHeight: 'var(--hero-height, 100vh)' },
  heroBg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', zIndex: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'rgba(42, 8, 14, 0.62)', zIndex: 1 },
  heroContent: { position: 'relative', zIndex: 2, flexDirection: 'column', alignItems: 'center', gap: '18px', padding: '60px 20px' },
  logoWrapper: { marginBottom: '8px' },
  heroLogo: { width: '250px', height: '250px', objectFit: 'contain', filter: 'brightness(0) invert(1) sepia(1) saturate(4) hue-rotate(5deg)', animation: 'logoPulse 4s ease-in-out infinite' },
  heroTitle: { fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 5vw, 64px)', color: '#C9A84C', letterSpacing: '6px', textTransform: 'uppercase', lineHeight: 1.2, animation: 'heroReveal 1s ease 0.3s both' },
  heroDivider: { width: '120px', height: '2px', background: 'linear-gradient(to right, transparent, #C9A84C, transparent)', animation: 'heroReveal 1s ease 0.6s both' },
  heroBy: { fontFamily: 'Cormorant Garamond, serif', fontSize: '30px', color: '#E2C97E', letterSpacing: '4px', animation: 'heroReveal 1s ease 0.8s both' },
  heroTagline: { fontFamily: 'Cormorant Garamond, serif', fontSize: '30px', color: '#FDF6EC', letterSpacing: '3px', fontStyle: 'italic', animation: 'heroReveal 1s ease 1s both' },
  heroBtn: { background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', padding: '14px 44px', fontFamily: 'Cinzel, serif', fontSize: '18px', letterSpacing: '3px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s', marginTop: '8px', animation: 'heroReveal 1s ease 1.2s both' },
  // CHANGE 8 — updated mobile hero
  heroMobile: { position: 'relative', zIndex: 2, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 20px', width: '100%', minHeight: '45vh', textAlign: 'center' },
heroMobileLogo: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1) sepia(1) saturate(4) hue-rotate(5deg)',
    animation: 'logoPulse 4s ease-in-out infinite',
  },
    heroMobileText: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  heroMobileTitle: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#C9A84C', letterSpacing: '2px', margin: 0 },
  heroMobileTagline: { fontFamily: 'Cormorant Garamond, serif', fontSize: '11px', color: '#FDF6EC', fontStyle: 'italic', margin: 0, opacity: 0.85 },
  heroMobileBy: { fontFamily: 'Cormorant Garamond, serif', fontSize: '10px', color: '#C9A84C', margin: 0, opacity: 0.75 },
  heroMobileBtn: { background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C', padding: '8px 14px', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase', flexShrink: 0 },
  collectionSection: { padding: '60px 16px', maxWidth: '1300px', margin: '0 auto', textAlign: 'center' },
  // CHANGE 9 — new styles
  sectionGroup: { marginBottom: '48px' },
  groupTitle: { fontFamily: 'Cinzel, serif', fontSize: 'clamp(14px, 3vw, 22px)', color: '#6B1B2A', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'left', borderLeft: '3px solid #C9A84C', paddingLeft: '12px' },
  horizontalRow: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '80px' },
  loadingSpinner: { width: '40px', height: '40px', border: '3px solid #E2C97E', borderTop: '3px solid #6B1B2A', borderRadius: '50%', animation: 'rotate 1s linear infinite' },
  loadingText: { fontFamily: 'Cinzel, serif', color: '#6B1B2A', letterSpacing: '2px' },
  empty: { padding: '80px', textAlign: 'center' },
  emptyText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#6B1B2A' },
  // CHANGE 9 — updated card
  card: { background: '#fff', border: '1px solid #F5ECD8', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s', textAlign: 'center', minWidth: '200px', maxWidth: '220px', flexShrink: 0 },
  imageWrapper: { position: 'relative', height: '280px', overflow: 'hidden' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', cursor: 'pointer' },
  tagBadge: { position: 'absolute', top: '10px', left: '10px', background: '#6B1B2A', color: '#C9A84C', padding: '4px 10px', fontSize: '10px', fontFamily: 'Cinzel, serif', letterSpacing: '1px', zIndex: 2 },
  wishlistBtn: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.92)', border: '1px solid #eee', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', cursor: 'pointer', zIndex: 2, transition: 'color 0.2s', lineHeight: 1 },
  outOfStock: { position: 'absolute', bottom: '12px', left: '12px', background: '#6B1B2A', color: '#C9A84C', padding: '4px 12px', fontSize: '11px', fontFamily: 'Cinzel, serif', letterSpacing: '1px' },
  cardBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  productName: { fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px' },
  productDetail: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' },
  price: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#6B1B2A', fontWeight: '600' },
  cardBtns: { display: 'flex', gap: '6px', marginTop: '8px' },
  cartBtn: { flex: 1, background: 'transparent', border: '1px solid #6B1B2A', color: '#6B1B2A', padding: '8px', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s' },
  buyBtn: { flex: 1, background: '#6B1B2A', border: '1px solid #6B1B2A', color: '#C9A84C', padding: '8px', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.3s' },
  reviewSection: { background: '#6B1B2A', padding: '60px 20px', textAlign: 'center' },
  reviewSlider: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', maxWidth: '700px', margin: '0 auto' },
  reviewArrow: { background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', fontSize: '28px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s' },
  reviewCard: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '140px', justifyContent: 'center' },
  reviewStars: { color: '#C9A84C', fontSize: '18px', margin: 0, letterSpacing: '2px' },
  reviewComment: { fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FDF6EC', fontStyle: 'italic', lineHeight: 1.7, margin: 0 },
  reviewName: { fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#C9A84C', letterSpacing: '2px', margin: 0 },
  reviewDots: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' },
  reviewDot: { width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'background 0.3s', padding: 0 },
  aboutSection: { background: '#2C2C2C', padding: '60px 20px', textAlign: 'center' },
  aboutContent: { maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  aboutText: { fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#FDF6EC', lineHeight: 1.8, fontStyle: 'italic' },
  contactSection: { padding: '60px 20px', textAlign: 'center', background: '#FDF6EC' },
  contactSubtitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#888', fontStyle: 'italic', letterSpacing: '2px', marginBottom: '40px', textAlign: 'center' },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' },
  contactCard: { background: '#fff', border: '1px solid #F5ECD8', padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', transition: 'box-shadow 0.3s' },
  contactIconBox: { width: '56px', height: '56px', borderRadius: '50%', background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2C97E' },
  contactCardTitle: { fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#6B1B2A', letterSpacing: '2px', textTransform: 'uppercase' },
  contactCardValue: { fontFamily: 'Raleway, sans-serif', fontSize: '13px', color: '#555', textDecoration: 'none', letterSpacing: '0.5px', lineHeight: 1.4 },
  footer: { background: '#2C2C2C', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' },
  footerLogo: { height: '44px', width: '44px', objectFit: 'contain', opacity: 0.6, filter: 'brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(5deg)' },
  footerBrand: { fontFamily: 'Cinzel, serif', fontSize: '16px', color: '#C9A84C', letterSpacing: '4px' },
  footerTagline: { fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: '#888', fontStyle: 'italic' },
  footerLinks: { display: 'flex', gap: '24px' },
  footerLink: { color: '#FDF6EC', textDecoration: 'none', fontFamily: 'Raleway, sans-serif', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' },
  footerCopy: { color: '#555', fontSize: '12px', fontFamily: 'Raleway, sans-serif' },
};

export default Home;