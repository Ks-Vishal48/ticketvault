import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'admin'
    ? '/admin' : user?.role === 'vendor'
    ? '/vendor' : '/dashboard';

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <Ticket size={24} color="#6c63ff" />
          <span>TicketVault</span>
        </Link>

        <div style={styles.links} className={menuOpen ? 'mobile-open' : ''}>
          <Link to="/events" style={styles.link}>Events</Link>
          {user ? (
            <>
              <Link to={dashboardLink} style={styles.link}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={16} /> Logout
              </button>
              <div style={styles.avatar}>
                <User size={16} />
                <span>{user.name?.split(' ')[0]}</span>
                <span style={styles.roleBadge}>{user.role}</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/events" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Events</Link>
          {user ? (
            <>
              <Link to={dashboardLink} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLink}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: '#1a1a2e',
    borderBottom: '1px solid #2a2a4a',
    position: 'sticky', top: 0, zIndex: 100,
  },
  inner: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '1.2rem', fontWeight: '700',
    color: '#fff',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    '@media (max-width: 768px)': { display: 'none' },
  },
  link: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    color: '#94a3b8', fontSize: '0.9rem',
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'none', border: 'none', color: '#94a3b8',
    fontSize: '0.9rem', cursor: 'pointer',
  },
  avatar: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    background: '#16213e', borderRadius: '20px',
    padding: '0.3rem 0.75rem', fontSize: '0.85rem',
  },
  roleBadge: {
    background: '#6c63ff22', color: '#a78bfa',
    borderRadius: '10px', padding: '0.1rem 0.4rem',
    fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
  },
  menuBtn: {
    background: 'none', border: 'none', color: '#e2e8f0',
    display: 'none',
    '@media (max-width: 768px)': { display: 'block' },
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    background: '#16213e', borderTop: '1px solid #2a2a4a',
    padding: '1rem',
  },
  mobileLink: {
    padding: '0.75rem', color: '#e2e8f0', display: 'block',
    background: 'none', border: 'none', textAlign: 'left',
    fontSize: '0.95rem', cursor: 'pointer',
  },
};
