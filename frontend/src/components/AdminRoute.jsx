import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Cinzel, serif', color: '#6B1B2A' }}>Loading...</div>;

  if (!user || user.role !== 'admin') return <Navigate to="/login" />;

  return children;
};

export default AdminRoute;