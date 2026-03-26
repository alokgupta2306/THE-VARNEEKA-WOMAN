import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgotpassword', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <img src="/logo.svg" alt="logo" style={styles.logo} />
        <h2 style={styles.title}>Forgot Password</h2>
        <div style={styles.divider} />

        {sent ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>✅ Password reset email sent!</p>
            <p style={styles.successSub}>Check your inbox and follow the link to reset your password.</p>
            <Link to="/login" style={styles.backLink}>← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.desc}>Enter your registered email and we'll send you a reset link.</p>
            <div style={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link to="/login" style={styles.backLink}>← Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#6B1B2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  box: {
    background: '#FDF6EC',
    padding: '48px 40px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  },
  logo: {
    height: '70px',
    objectFit: 'contain',
  },
  title: {
    fontFamily: 'Cinzel, serif',
    fontSize: '24px',
    color: '#6B1B2A',
    letterSpacing: '3px',
  },
  divider: {
    width: '60px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    textAlign: 'left',
  },
  desc: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    letterSpacing: '1px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  btn: {
    background: '#6B1B2A',
    color: '#C9A84C',
    border: '1px solid #C9A84C',
    padding: '14px',
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    letterSpacing: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  backLink: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#6B1B2A',
    textDecoration: 'none',
    textAlign: 'center',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'Cinzel, serif',
    fontSize: '16px',
    color: '#6B1B2A',
    letterSpacing: '1px',
  },
  successSub: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '13px',
    color: '#888',
    lineHeight: 1.6,
  },
};

export default ForgotPassword;