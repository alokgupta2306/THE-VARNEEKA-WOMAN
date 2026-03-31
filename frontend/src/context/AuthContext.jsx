import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('varneekaUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // If name or email missing, fetch fresh user data
      if (!parsed.name || !parsed.email) {
        fetchUserData(parsed.token);
      }
    }
    setLoading(false);
  }, []);

  const fetchUserData = async (token) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data._id) {
        const updated = { ...data, token };
        setUser(updated);
        localStorage.setItem('varneekaUser', JSON.stringify(updated));
      }
    } catch (err) {
      console.log('Failed to fetch user data');
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('varneekaUser', JSON.stringify(userData));

    // If name or email missing, fetch fresh data
    if (!userData.name || !userData.email) {
      fetchUserData(userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('varneekaUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);