import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/auth/google`;
  };

  return (
    <div style={styles.page} className="auth-page">
      {/* Left decorative panel */}
      <div style={styles.leftPanel} className="auth-left">
        <div style={styles.mandala}>
          <img src="/logo.svg" alt="" style={styles.mandalaImg} />
        </div>
        <div style={styles.leftContent}>
          <h1 style={styles.brandName} className="brand-name">THE VARNEEKA WOMAN</h1>
          <div style={styles.divider} />
          <p style={styles.brandTagline}>Thoughtfully Curated Handloom Sarees</p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={styles.rightPanel} className="auth-right">
        <div style={styles.formBox}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your account</p>
          <div style={styles.dividerSmall} />

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div style={styles.field}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={styles.orRow}>
            <div style={styles.orLine} />
            <span style={styles.orText}>or</span>
            <div style={styles.orLine} />
          </div>

          <button style={styles.googleBtn} onClick={handleGoogleLogin}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: '18px', height: '18px' }}
            />
            Continue with Google
          </button>

          <p style={styles.registerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.registerLink}>Register here</Link>
          </p>

          <p style={styles.homeLink}>
            <Link to="/" style={styles.registerLink}>← Back to Home</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .auth-page {
            flex-direction: column !important;
          }
          .auth-left {
            min-height: 180px !important;
            flex: none !important;
          }
          .auth-left .brand-name {
            font-size: 18px !important;
          }
          .auth-right {
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    background: '#6B1B2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '200px',
  },
  mandala: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    opacity: 0.08,
    animation: 'rotate 30s linear infinite',
  },
  mandalaImg: { width: '100%', height: '100%', objectFit: 'contain' },
  leftContent: { position: 'relative', zIndex: 2, textAlign: 'center', padding: '40px' },
  brandName: {
    fontFamily: 'Cinzel, serif',
    fontSize: 'clamp(25px, 5vw, 45px)',
    color: '#C9A84C',
    letterSpacing: '4px',
    lineHeight: 1.3,
  },
  divider: {
    width: '80px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
    margin: '20px auto',
  },
  brandTagline: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '24px',
    color: '#FDF6EC',
    fontStyle: 'italic',
    letterSpacing: '2px',
  },
  rightPanel: {
    flex: 1,
    background: '#FDF6EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  formBox: {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontFamily: 'Cinzel, serif',
    fontSize: '28px',
    color: '#6B1B2A',
    letterSpacing: '3px',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    letterSpacing: '1px',
  },
  dividerSmall: {
    width: '60px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
    margin: '0 auto',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  forgotRow: { textAlign: 'right' },
  forgotLink: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#6B1B2A',
    textDecoration: 'none',
    letterSpacing: '1px',
  },
  submitBtn: {
    background: '#6B1B2A',
    color: '#C9A84C',
    border: '1px solid #C9A84C',
    padding: '14px',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.3s',
    marginTop: '8px',
  },
  orRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  orLine: { flex: 1, height: '1px', background: '#E2C97E' },
  orText: { fontFamily: 'Raleway, sans-serif', fontSize: '12px', color: '#888', letterSpacing: '2px' },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: '#fff',
    border: '1px solid #ddd',
    padding: '12px',
    fontFamily: 'Raleway, sans-serif',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#2C2C2C',
    transition: 'all 0.3s',
  },
  registerText: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
  },
  registerLink: { color: '#6B1B2A', textDecoration: 'none', fontWeight: '600' },
  homeLink: { textAlign: 'center', fontFamily: 'Raleway, sans-serif', fontSize: '13px' },
};

export default Login;