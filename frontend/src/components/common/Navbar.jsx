import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

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
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <Ticket size={24} color="#6c63ff" />
          <span>TicketVault</span>
        </Link>

        <div className={styles.links}>
          <Link to="/events" className={styles.link}>Events</Link>
          {user ? (
            <>
              <Link to={dashboardLink} className={styles.link}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={16} /> Logout
              </button>
              <div className={styles.avatar}>
                <User size={16} />
                <span>{user.name?.split(' ')[0]}</span>
                <span className={styles.roleBadge}>{user.role}</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/events" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Events</Link>
          {user ? (
            <>
              <Link to={dashboardLink} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className={styles.mobileLink}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
