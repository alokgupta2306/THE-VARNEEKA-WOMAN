import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = ({ cartCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={styles.nav}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <img src="/logo.svg" alt="The Varneeka Woman" style={styles.logoImg} />
          <div style={styles.logoText}>
            <span style={styles.logoName}>THE VARNEEKA WOMAN</span>
            <span style={styles.logoBy}>by Capt Aditi Samant</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          <span style={styles.link} onClick={() => scrollTo('about')}>About</span>
          <span style={styles.link} onClick={() => scrollTo('contact')}>Contact Us</span>
          {user && user.role === 'admin' && (
  <>
    <Link to="/admin/products" style={styles.link}>Add Saree</Link>
    <Link to="/admin/orders" style={styles.link}>Orders</Link>
    <Link to="/admin/payments" style={styles.link}>Payments</Link>
    <Link to="/admin/customers" style={styles.link}>Customers</Link>
    <Link to="/admin/analytics" style={styles.link}>Analytics</Link>
  </>
)}
        </div>

        {/* Right Icons */}
        <div style={styles.icons}>
          {user ? (
            <>
              {user.role !== 'admin' && (
                <Link to="/cart" style={styles.iconBtn}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                </Link>
              )}
              <Link to="/account" style={styles.iconBtn}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              {/* Hide logout on mobile — available in hamburger menu */}
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </>
          )}

          {/* Hamburger */}
          <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
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

      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .logout-desktop { display: none !important; }
          .login-register-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: '#6B1B2A',
    borderBottom: '2px solid #C9A84C',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  logoImg: {
    height: '40px',
    width: '40px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  logoName: {
    fontFamily: 'Cinzel, serif',
    fontSize: 'clamp(9px, 2vw, 14px)',
    color: '#C9A84C',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  logoBy: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 'clamp(9px, 1.5vw, 12px)',
    color: '#FDF6EC',
    fontStyle: 'italic',
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  link: {
    color: '#FDF6EC',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'color 0.3s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  iconBtn: {
    color: '#C9A84C',
    textDecoration: 'none',
    fontSize: '18px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#C9A84C',
    color: '#6B1B2A',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    padding: '5px 12px',
    fontFamily: 'Cinzel, serif',
    fontSize: '10px',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  loginBtn: {
    color: '#C9A84C',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  registerBtn: {
    background: '#C9A84C',
    color: '#6B1B2A',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '6px 12px',
    whiteSpace: 'nowrap',
  },
  hamburger: {
    background: 'transparent',
    border: 'none',
    color: '#C9A84C',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  mobileMenu: {
    backgroundColor: '#4a1020',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px',
    gap: '0px',
    borderBottom: '2px solid #C9A84C',
    zIndex: 999,
  },
  mobileLink: {
    color: '#FDF6EC',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '14px 0',
    borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
    cursor: 'pointer',
    display: 'block',
  },
  mobileLogout: {
    background: 'transparent',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    padding: '12px',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    marginTop: '16px',
    width: '100%',
  }
};

export default Navbar;