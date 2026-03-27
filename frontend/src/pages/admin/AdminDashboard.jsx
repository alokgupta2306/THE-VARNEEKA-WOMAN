import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const icons = {
  addSaree: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="24" height="28" rx="1" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <line x1="14" y1="14" x2="26" y2="14" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="14" y1="20" x2="26" y2="20" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="20" y1="26" x2="26" y2="26" stroke="#C9A84C" strokeWidth="1.5"/>
      <circle cx="14" cy="26" r="3" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <line x1="20" y1="6" x2="20" y2="2" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="16" y1="2" x2="24" y2="2" stroke="#C9A84C" strokeWidth="1.5"/>
    </svg>
  ),
  orders: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="28" height="22" rx="1" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <path d="M13 10 V7 Q20 4 27 7 V10" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <line x1="13" y1="18" x2="27" y2="18" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="13" y1="23" x2="22" y2="23" stroke="#C9A84C" strokeWidth="1.5"/>
      <circle cx="27" cy="27" r="5" fill="#6B1B2A" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="27" y1="24" x2="27" y2="30" stroke="#C9A84C" strokeWidth="1.2"/>
      <line x1="24" y1="27" x2="30" y2="27" stroke="#C9A84C" strokeWidth="1.2"/>
    </svg>
  ),
  payments: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="30" height="20" rx="2" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <line x1="5" y1="16" x2="35" y2="16" stroke="#C9A84C" strokeWidth="1.5"/>
      <rect x="10" y="21" width="6" height="4" rx="1" stroke="#C9A84C" strokeWidth="1.2" fill="none"/>
      <line x1="20" y1="22" x2="28" y2="22" stroke="#C9A84C" strokeWidth="1.2"/>
      <line x1="20" y1="25" x2="25" y2="25" stroke="#C9A84C" strokeWidth="1.2"/>
    </svg>
  ),
  customers: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="14" r="5" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <path d="M5 32 Q5 24 15 24 Q25 24 25 32" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
      <circle cx="28" cy="14" r="4" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeDasharray="2 1"/>
      <path d="M26 24 Q34 24 34 31" stroke="#C9A84C" strokeWidth="1.2" fill="none" strokeDasharray="2 1"/>
    </svg>
  ),
  analytics: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="32" x2="8" y2="8" stroke="#C9A84C" strokeWidth="1.5"/>
      <line x1="8" y1="32" x2="34" y2="32" stroke="#C9A84C" strokeWidth="1.5"/>
      <rect x="12" y="22" width="5" height="10" stroke="#C9A84C" strokeWidth="1.2" fill="none"/>
      <rect x="20" y="16" width="5" height="16" stroke="#C9A84C" strokeWidth="1.2" fill="none"/>
      <rect x="28" y="10" width="5" height="22" stroke="#C9A84C" strokeWidth="1.2" fill="none"/>
      <polyline points="14,20 22,14 30,8" stroke="#C9A84C" strokeWidth="1" strokeDasharray="2 1"/>
    </svg>
  ),
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { title: 'Add Saree', desc: 'Upload new sarees to the collection', icon: icons.addSaree, path: '/admin/products' },
    { title: 'Get Orders', desc: 'View and manage all customer orders', icon: icons.orders, path: '/admin/orders' },
    { title: 'Payments', desc: 'View all received payments', icon: icons.payments, path: '/admin/payments' },
    { title: 'Customers', desc: 'Track and message customers', icon: icons.customers, path: '/admin/customers' },
    { title: 'Analytics', desc: 'View business performance data', icon: icons.analytics, path: '/admin/analytics' },
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
              onMouseEnter={e => {
                e.currentTarget.style.background = '#6B1B2A';
                e.currentTarget.style.borderColor = '#C9A84C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#F5ECD8';
              }}
            >
              <div style={styles.iconBox}>
                {card.icon}
              </div>
              <div style={styles.cardDivider} />
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #F5ECD8',
    padding: '36px 20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '1px solid #F5ECD8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FDF6EC',
  },
  cardDivider: {
    width: '30px',
    height: '1px',
    background: '#C9A84C',
    margin: '4px auto',
  },
  cardTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '13px',
    color: '#6B1B2A',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontFamily: 'Raleway, sans-serif',
    fontSize: '11px',
    color: '#888',
    lineHeight: 1.6,
  },
};

export default AdminDashboard;