import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      // Fetch full user data after Google login
      const fetchAndLogin = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = await response.json();
          login({ ...userData, token });
        } catch (err) {
          login({ token, role });
        }

        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      };

      fetchAndLogin();
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#6B1B2A' }}>
      <p style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: '18px', letterSpacing: '3px' }}>
        Signing you in...
      </p>
    </div>
  );
};

export default GoogleSuccess;