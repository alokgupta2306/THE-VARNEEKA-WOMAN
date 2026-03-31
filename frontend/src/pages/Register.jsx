import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      login(data);
      toast.success(`Welcome, ${data.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/auth/google`;
  };

  return (
    <div style={styles.page} className="auth-page">
      {/* Left Panel */}
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

      {/* Right Panel */}
      <div style={styles.rightPanel} className="auth-right">
        <div style={styles.formBox}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join The Varneeka Woman family</p>
          <div style={styles.dividerSmall} />

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>
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
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div style={styles.field}>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
            Sign up with Google
          </button>

          <p style={styles.loginText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.loginLink}>Login Here</Link>
          </p>
          <p style={{ textAlign: 'center' }}>
            <Link to="/" style={styles.loginLink}>← Back to Home</Link>
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
  },
  loginText: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
  },
  loginLink: { color: '#6B1B2A', textDecoration: 'none', fontWeight: '600' },
};

export default Register;