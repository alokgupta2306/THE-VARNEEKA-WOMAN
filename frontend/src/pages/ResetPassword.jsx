import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/resetpassword', {
        token,
        password: form.password
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <img src="/logo.png" alt="logo" style={styles.logo} />
        <h2 style={styles.title}>Reset Password</h2>
        <div style={styles.divider} />

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>New Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
              required
            />
          </div>
          <div style={styles.field}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Re-enter password"
              required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
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
  logo: { height: '70px', objectFit: 'contain' },
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
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
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
};

export default ResetPassword;