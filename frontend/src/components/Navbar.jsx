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
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
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
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <span style={styles.mobileLink} onClick={() => { scrollTo('about'); setMenuOpen(false); }}>About</span>
          <span style={styles.mobileLink} onClick={() => { scrollTo('contact'); setMenuOpen(false); }}>Contact</span>
          {user && (
            <>
              <Link to="/account" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Account</Link>
              {user.role !== 'admin' && (
                <Link to="/cart" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Cart</Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/products" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Add Saree</Link>
                  <Link to="/admin/orders" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Orders</Link>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 40px',
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
    gap: '12px',
  },
  logoImg: {
    height: '50px',
    objectFit: 'contain',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  logoName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    color: '#C9A84C',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  logoBy: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '12px',
    color: '#FDF6EC',
    fontStyle: 'italic',
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  link: {
    color: '#FDF6EC',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'color 0.3s',
    cursor: 'pointer',
  },
  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
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
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    padding: '6px 16px',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  loginBtn: {
    color: '#C9A84C',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  registerBtn: {
    background: '#C9A84C',
    color: '#6B1B2A',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '8px 16px',
  },
  hamburger: {
    background: 'transparent',
    border: 'none',
    color: '#C9A84C',
    fontSize: '22px',
    cursor: 'pointer',
  },
  mobileMenu: {
    backgroundColor: '#6B1B2A',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    gap: '16px',
    borderBottom: '2px solid #C9A84C',
  },
  mobileLink: {
    color: '#FDF6EC',
    textDecoration: 'none',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '8px 0',
    borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
    cursor: 'pointer',
  },
  mobileLogout: {
    background: 'transparent',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    padding: '10px',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  }
};

export default Navbar;