import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { title: 'Add Saree', desc: 'Upload new sarees to the collection', icon: '👗', path: '/admin/products' },
    { title: 'Get Orders', desc: 'View and manage all customer orders', icon: '📦', path: '/admin/orders' },
    { title: 'Payments', desc: 'View all received payments', icon: '💳', path: '/admin/payments' },
    { title: 'Customers', desc: 'Track and message customers', icon: '👥', path: '/admin/customers' },
    { title: 'Analytics', desc: 'View business performance data', icon: '📊', path: '/admin/analytics' },
  ];

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        {/* Welcome */}
        <div style={styles.welcomeBox}>
          <img src="/logo.svg" alt="The Varneeka Woman" style={styles.dashLogo} />
          <h1 style={styles.welcome}>Welcome, Aditi</h1>
          <div style={styles.divider} />
          <p style={styles.welcomeSub}>The Varneeka Woman — Admin Dashboard</p>
        </div>

        {/* Cards */}
        <div style={styles.grid}>
          {cards.map((card) => (
            <div
              key={card.title}
              style={styles.card}
              onClick={() => navigate(card.path)}
            >
              <span style={styles.cardIcon}>{card.icon}</span>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardDesc}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '60px 20px',
    textAlign: 'center',
  },
  welcomeBox: {
    marginBottom: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  dashLogo: {
    height: '100px',
    objectFit: 'contain',
    marginBottom: '8px',
  },
  welcome: {
    fontFamily: 'Cinzel, serif',
    fontSize: '36px',
    color: '#6B1B2A',
    letterSpacing: '4px',
  },
  divider: {
    width: '80px',
    height: '2px',
    background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
    margin: '4px auto',
  },
  welcomeSub: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '18px',
    color: '#888',
    fontStyle: 'italic',
    letterSpacing: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '40px 24px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  cardIcon: { fontSize: '40px' },
  cardTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    color: '#6B1B2A',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '12px',
    color: '#888',
    lineHeight: 1.6,
  },
};

export default AdminDashboard;