import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../utils/api';

const PAISLEYS = [
  { x: '5%',  top: '18px', size: 18, dur: 8,  del: 0   },
  { x: '12%', top: '38px', size: 13, dur: 11, del: 2   },
  { x: '22%', top: '12px', size: 16, dur: 9,  del: 1.2 },
  { x: '33%', top: '42px', size: 12, dur: 13, del: 3   },
  { x: '44%', top: '20px', size: 15, dur: 10, del: 0.8 },
  { x: '55%', top: '44px', size: 11, dur: 7,  del: 2.5 },
  { x: '66%', top: '14px', size: 14, dur: 12, del: 1.5 },
  { x: '75%', top: '40px', size: 13, dur: 9,  del: 3.2 },
  { x: '85%', top: '22px', size: 16, dur: 11, del: 0.5 },
  { x: '93%', top: '36px', size: 12, dur: 8,  del: 2   },
];

const PaisleySVG = ({ size }) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1C14 1 19 5 18 11C17 17 13 21 10 28C7 21 3 17 2 11C1 5 6 1 10 1Z" fill="#C9A84C" opacity="0.9"/>
    <path d="M10 8C11.5 8 13 9.5 12.5 11C12 12.5 11 13.5 10 15C9 13.5 8 12.5 7.5 11C7 9.5 8.5 8 10 8Z" fill="#6B1B2A" opacity="0.6"/>
    <circle cx="10" cy="4" r="1.2" fill="#C9A84C" opacity="0.7"/>
  </svg>
);

const Navbar = ({ cartCount = 0, heroScrolled = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const showLogo = isHomePage ? heroScrolled : true;

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // FIX 1: Track which scroll-section is active (for About / Contact underline)
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    // Reset section highlight when not on home page
    if (!isHomePage) { setActiveSection(''); return; }

    const sections = ['about', 'contact'];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });

    // If at very top of home, clear section active
    const handleScroll = () => {
      if (window.scrollY < 100) setActiveSection('');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observers.forEach(o => o && o.disconnect());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await API.get('/products', { params: {} });
      const filtered = data.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(filtered.slice(0, 6));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (product) => {
    navigate(`/product/${product._id}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const scrollTo = (id) => {
    if (location.pathname !== '/') { window.location.href = `/#${id}`; return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  // Helper: is a nav link active?
  const linkActive = (key) => {
    if (key === 'home') return location.pathname === '/' && activeSection === '';
    if (key === 'about') return activeSection === 'about';
    if (key === 'contact') return activeSection === 'contact';
    return location.pathname.startsWith(`/admin/${key}`);
  };

  return (
    <>
      <style>{`
        @keyframes sheenSweep {
          0%   { left: -60%; opacity: 0; }
          10%  { opacity: 1; }
          60%  { left: 110%; opacity: 0.6; }
          100% { left: 110%; opacity: 0; }
        }
        @keyframes paisleyFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); opacity: 0.13; }
          50%      { transform: translateY(-7px) rotate(4deg); opacity: 0.28; }
        }

        /* ── nav link base ── */
        .vw-link {
          position: relative;
          color: #FDF6EC;
          text-decoration: none;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          padding-bottom: 3px;
          white-space: nowrap;
          background: none;
          border: none;
          transition: color 0.3s ease;
          display: inline-block;
        }
        .vw-link::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 1.5px;
          background: #C9A84C;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .vw-link:hover { color: #C9A84C; }
        .vw-link:hover::after { transform: scaleX(1); }
        .vw-link.vw-active { color: #C9A84C; }
        .vw-link.vw-active::after { transform: scaleX(1); }

        .vw-divider {
          color: #C9A84C;
          opacity: 0.35;
          font-size: 9px;
          user-select: none;
        }

        /* logout hover */
        .vw-logout:hover { background: #C9A84C !important; color: #6B1B2A !important; }

        /* ── mobile / desktop visibility ── */
        @media (max-width: 768px) {
    .nav-desktop-links { display: none !important; }
    .nav-logout { display: none !important; }
    .nav-hamburger { display: flex !important; }
  }
  @media (min-width: 769px) {
    .nav-hamburger { display: none !important; }
    .nav-desktop-links { display: flex !important; }
  }

        /* ── mobile links bar (below navbar, always visible on mobile) ── */
        .vw-mobile-links-bar {
          display: none;
          background: #5a1520;
          border-bottom: 1px solid rgba(201,168,76,0.3);
          padding: 8px 16px;
          gap: 10px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          position: sticky;
          top: 58px;
          z-index: 999;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .vw-mobile-links-bar { display: flex !important; }
          .vw-link { font-size: 10px; letter-spacing: 1.5px; }
        }

        /* search dropdown */
        .vw-search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 300px;
          background: #fff;
          border: 1px solid #C9A84C;
          z-index: 3000;
          max-height: 360px;
          overflow-y: auto;
          box-shadow: 0 8px 24px rgba(107,27,42,0.12);
        }
      `}</style>

      {/* ════════ MAIN NAVBAR ════════ */}
      <nav style={styles.nav}>

        {/* Silk sheen */}
        <div style={styles.silkSheen} />

        {/* Paisleys */}
        <div style={styles.paisleyLayer} aria-hidden="true">
          {PAISLEYS.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', left: p.x, top: p.top,
              animation: `paisleyFloat ${p.dur}s ease-in-out ${p.del}s infinite`,
              opacity: 0.13, pointerEvents: 'none',
            }}>
              <PaisleySVG size={p.size} />
            </div>
          ))}
        </div>

        {/* ── LEFT: hamburger + desktop links ── */}
        <div style={styles.leftSection}>

          {/* Hamburger — mobile only */}
          <button className="vw-hamburger" style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>

          {/* Desktop links */}
          <div style={styles.links} className="vw-desktop-links">
            <Link to="/" className={`vw-link${linkActive('home') ? ' vw-active' : ''}`}>Home</Link>
            <span className="vw-divider">✦</span>
            <span className={`vw-link${linkActive('about') ? ' vw-active' : ''}`} onClick={() => scrollTo('about')}>About</span>
            <span className="vw-divider">✦</span>
            <span className={`vw-link${linkActive('contact') ? ' vw-active' : ''}`} onClick={() => scrollTo('contact')}>Contact Us</span>

            {user?.role === 'admin' && (
              <>
                <span className="vw-divider">✦</span>
                <Link to="/admin/products" className={`vw-link${linkActive('products') ? ' vw-active' : ''}`}>Add Saree</Link>
                <span className="vw-divider">✦</span>
                <Link to="/admin/orders" className={`vw-link${linkActive('orders') ? ' vw-active' : ''}`}>Orders</Link>
                <span className="vw-divider">✦</span>
                <Link to="/admin/payments" className={`vw-link${linkActive('payments') ? ' vw-active' : ''}`}>Payments</Link>
                <span className="vw-divider">✦</span>
                <Link to="/admin/customers" className={`vw-link${linkActive('customers') ? ' vw-active' : ''}`}>Customers</Link>
                <span className="vw-divider">✦</span>
                <Link to="/admin/analytics" className={`vw-link${linkActive('analytics') ? ' vw-active' : ''}`}>Analytics</Link>
              </>
            )}
          </div>
        </div>

        {/* ── CENTER: Logo ── */}
        <Link to="/" style={styles.logo}>
          <img
            src="/logo.svg"
            alt="The Varneeka Woman"
            style={{
              ...styles.logoImg,
              opacity: showLogo ? 1 : 0,
              transform: showLogo ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              pointerEvents: showLogo ? 'auto' : 'none',
            }}
          />
          <div style={{
            ...styles.logoText,
            opacity: showLogo ? 1 : 0,
            transform: showLogo ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}>
            <span style={styles.logoName}>THE VARNEEKA WOMAN</span>
            <span style={styles.logoBy}>by Capt Aditi Samant</span>
          </div>
        </Link>

        {/* ── RIGHT: icons — FIX 2: consistent layout logged in & out ── */}
        <div style={styles.icons}>
          {user ? (
            <>
              {user.role !== 'admin' && (
                <Link to="/cart" style={styles.iconBtn}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                </Link>
              )}
              <Link to="/account" style={styles.iconBtn}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              <button
                className="vw-logout vw-desktop-logout"
                style={styles.logoutBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="vw-link" style={{ color: '#C9A84C' }}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </>
          )}

          {/* Search */}
          <button style={styles.searchIconBtn} onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(''); setSearchResults([]); }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {searchOpen && (
            <div className="vw-search-dropdown">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search sarees..."
                style={styles.searchInput}
              />
              {searching && <p style={styles.searchStatus}>Searching...</p>}
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p style={styles.searchStatus}>No sarees found</p>
              )}
              {searchResults.map(product => (
                <div
                  key={product._id}
                  style={styles.searchResultItem}
                  onClick={() => handleSelectResult(product)}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5ECD8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={styles.searchResultName}>{product.name}</span>
                  <span style={styles.searchResultDetail}>{product.fabric} · ₹{product.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ════════ MOBILE LINKS BAR — always visible on mobile ════════ */}
      <div className="vw-mobile-links-bar">
        {/* Sheen on mobile bar */}
        <div style={{ ...styles.silkSheen, animationDelay: '3s' }} />

        <Link to="/" className={`vw-link${linkActive('home') ? ' vw-active' : ''}`}>Home</Link>
        <span className="vw-divider">✦</span>
        <span className={`vw-link${linkActive('about') ? ' vw-active' : ''}`} onClick={() => scrollTo('about')}>About</span>
        <span className="vw-divider">✦</span>
        <span className={`vw-link${linkActive('contact') ? ' vw-active' : ''}`} onClick={() => scrollTo('contact')}>Contact Us</span>

        {user?.role === 'admin' && (
          <>
            <span className="vw-divider">✦</span>
            <Link to="/admin/products" className={`vw-link${linkActive('products') ? ' vw-active' : ''}`}>Add Saree</Link>
            <span className="vw-divider">✦</span>
            <Link to="/admin/orders" className={`vw-link${linkActive('orders') ? ' vw-active' : ''}`}>Orders</Link>
            <span className="vw-divider">✦</span>
            <Link to="/admin/payments" className={`vw-link${linkActive('payments') ? ' vw-active' : ''}`}>Payments</Link>
            <span className="vw-divider">✦</span>
            <Link to="/admin/customers" className={`vw-link${linkActive('customers') ? ' vw-active' : ''}`}>Customers</Link>
            <span className="vw-divider">✦</span>
            <Link to="/admin/analytics" className={`vw-link${linkActive('analytics') ? ' vw-active' : ''}`}>Analytics</Link>
          </>
        )}

        {user && (
          <>
            <span className="vw-divider">✦</span>
            <button className="vw-logout" style={{ ...styles.logoutBtn, fontSize: '9px', padding: '4px 9px' }} onClick={handleLogout}>Logout</button>
          </>
        )}

        {!user && (
          <>
            <span className="vw-divider">✦</span>
            <Link to="/login" className="vw-link" style={{ color: '#C9A84C' }}>Login</Link>
            <span className="vw-divider">✦</span>
            <Link to="/register" style={{ ...styles.registerBtn, fontSize: '8px', padding: '4px 8px' }}>Register</Link>
          </>
        )}
      </div>

      {/* ════════ MOBILE FULL MENU DRAWER ════════ */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <span style={styles.mobileLink} onClick={() => scrollTo('about')}>About</span>
          <span style={styles.mobileLink} onClick={() => scrollTo('contact')}>Contact Us</span>
          {user && (
            <>
              <Link to="/account" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Account</Link>
              {user.role !== 'admin' && (
                <Link to="/cart" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/admin/products" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Add Saree</Link>
                  <Link to="/admin/orders" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Orders</Link>
                  <Link to="/admin/payments" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Payments</Link>
                  <Link to="/admin/customers" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Customers</Link>
                  <Link to="/admin/analytics" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Analytics</Link>
                </>
              )}
              <button onClick={handleLogout} style={styles.mobileLogout}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </>
  );
};

const styles = {
  nav: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#6B1B2A',
    borderBottom: '1.5px solid #C9A84C',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  silkSheen: {
    position: 'absolute',
    top: 0, left: '-60%',
    width: '55%', height: '100%',
    background: 'linear-gradient(105deg, transparent 20%, rgba(201,168,76,0.08) 50%, transparent 80%)',
    animation: 'sheenSweep 6s ease-in-out 1s infinite',
    pointerEvents: 'none',
    zIndex: 1,
  },
  paisleyLayer: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none', zIndex: 1, overflow: 'hidden',
  },
  logo: {
    textDecoration: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', position: 'relative', zIndex: 2,
  },
  logoImg: { height: '40px', width: '40px', objectFit: 'contain', flexShrink: 0 },
  logoText: { display: 'flex', flexDirection: 'column', gap: '1px' },
  logoName: {
    fontFamily: 'Cinzel, serif',
    fontSize: 'clamp(9px, 2vw, 14px)',
    color: '#C9A84C', letterSpacing: '2px',
    textTransform: 'uppercase', lineHeight: 1.2,
  },
  logoBy: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 'clamp(9px, 1.5vw, 12px)',
    color: '#FDF6EC', fontStyle: 'italic', letterSpacing: '1px',
  },
  leftSection: {
    display: 'flex', alignItems: 'center', gap: '16px',
    position: 'relative', zIndex: 2,
  },
links: {
    display: 'none',
    gap: '24px',
    alignItems: 'center',
  },
    icons: {
    display: 'flex', alignItems: 'center', gap: '12px',
    flexShrink: 0, position: 'relative', zIndex: 2, justifyContent: 'flex-end',
  },
  iconBtn: {
    color: '#C9A84C', textDecoration: 'none',
    position: 'relative', display: 'flex', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: '-8px', right: '-8px',
    background: '#C9A84C', color: '#6B1B2A', borderRadius: '50%',
    width: '16px', height: '16px', fontSize: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C',
    padding: '5px 12px', fontFamily: 'Cinzel, serif', fontSize: '10px',
    letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap',
  },
  registerBtn: {
    background: '#C9A84C', color: '#6B1B2A', textDecoration: 'none',
    fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px',
    textTransform: 'uppercase', padding: '6px 12px', whiteSpace: 'nowrap',
  },
  hamburger: {
    background: 'transparent',
    border: 'none',
    color: '#C9A84C',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center',
    padding: '4px',
  },
  searchIconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: '4px', position: 'relative',
  },
  searchInput: {
    width: '100%', padding: '14px 16px', border: 'none',
    borderBottom: '1px solid #F5ECD8', fontFamily: 'Raleway, sans-serif',
    fontSize: '14px', outline: 'none', color: '#2C2C2C', boxSizing: 'border-box',
  },
  searchStatus: {
    padding: '12px 16px', fontFamily: 'Raleway, sans-serif',
    fontSize: '13px', color: '#888', fontStyle: 'italic',
  },
  searchResultItem: {
    padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F5ECD8',
    display: 'flex', flexDirection: 'column', gap: '3px',
    transition: 'background 0.2s', background: '#fff',
  },
  searchResultName: {
    fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#6B1B2A', letterSpacing: '1px',
  },
  searchResultDetail: { fontFamily: 'Raleway, sans-serif', fontSize: '11px', color: '#888' },
  mobileMenu: {
    backgroundColor: '#4a1020', display: 'flex', flexDirection: 'column',
    padding: '16px 24px', gap: '0px', borderBottom: '2px solid #C9A84C', zIndex: 999,
  },
  mobileLink: {
    color: '#FDF6EC', textDecoration: 'none', fontFamily: 'Cinzel, serif',
    fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase',
    padding: '14px 0', borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
    cursor: 'pointer', display: 'block',
  },
  mobileLogout: {
    background: 'transparent', border: '1px solid #C9A84C', color: '#C9A84C',
    padding: '12px', fontFamily: 'Cinzel, serif', fontSize: '12px',
    letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase',
    marginTop: '16px', width: '100%',
  },
};

export default Navbar;