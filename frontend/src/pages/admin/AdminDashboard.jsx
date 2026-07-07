import { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers, getAdminEvents, toggleUserStatus, updateUserRole, getAllBookings } from '../../services/api';
import { Users, Ticket, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeBadge, getBookingStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    if (tab === 'events') fetchEvents();
    if (tab === 'bookings') fetchBookings();
  }, [tab]);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      setStats(res.data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    const res = await getAdminUsers({ limit: 50 });
    setUsers(res.data.users);
  };

  const fetchEvents = async () => {
    const res = await getAdminEvents({ limit: 50 });
    setEvents(res.data.events);
  };

  const fetchBookings = async () => {
    const res = await getAllBookings({ limit: 50 });
    setBookings(res.data.bookings);
  };

  const handleToggleUser = async (id) => {
    try {
      await toggleUserStatus(id);
      toast.success('User status updated');
      fetchUsers();
    } catch { toast.error('Failed to update'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  if (loading) return <div className="page-loader"><div className={`spinner ${styles.spinnerSmall}`} /></div>;

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className={`grid-4 ${styles.statsGrid}`}>
          {[
            { label: 'Total Users', value: stats?.totalUsers, icon: <Users size={22} color="#6c63ff" />, iconClass: styles.statUsersIcon },
            { label: 'Total Events', value: stats?.totalEvents, icon: <Calendar size={22} color="#22c55e" />, iconClass: styles.statEventsIcon },
            { label: 'Total Bookings', value: stats?.totalBookings, icon: <Ticket size={22} color="#06b6d4" />, iconClass: styles.statBookingsIcon },
            { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue), icon: <DollarSign size={22} color="#f59e0b" />, iconClass: styles.statRevenueIcon },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className={`stat-icon ${stat.iconClass}`}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value ?? '—'}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['overview', 'users', 'events', 'bookings'].map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.contentArea}>
          {tab === 'overview' && (
            <div>
              <h3 className={styles.sectionTitle}>Recent Bookings</h3>
              <div className={styles.table}>
                <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                  <span>Event</span><span>Customer</span><span>Amount</span><span>Status</span><span>Date</span>
                </div>
                {(stats?.recentBookings || []).map(b => (
                  <div key={b._id} className={styles.tableRow}>
                    <span>{b.event?.title}</span>
                    <span>{b.user?.name}</span>
                    <span className={styles.highlightValue}>{formatCurrency(b.totalAmount)}</span>
                    <span className={`badge ${getBookingStatusBadge(b.status)}`}>{b.status}</span>
                    <span className={styles.rowTextMuted}>{formatDate(b.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.userRow} ${styles.tableHeader}`}>
                <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
              </div>
              {users.map(u => (
                <div key={u._id} className={`${styles.tableRow} ${styles.userRow}`}>
                  <span>{u.name}</span>
                  <span className={styles.rowTextMuted}>{u.email}</span>
                  <select
                    className={styles.selectInput}
                    value={u.role}
                    onChange={e => handleRoleChange(u._id, e.target.value)}>
                    {['customer', 'vendor'].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <span className={u.isActive ? styles.activeStatus : styles.inactiveStatus}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleUser(u._id)}>
                    {u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'events' && (
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <span>Title</span><span>Type</span><span>Vendor</span><span>Date</span><span>Status</span>
              </div>
              {events.map(e => (
                <div key={e._id} className={styles.tableRow}>
                  <span>{e.title}</span>
                  <span className={`badge ${getEventTypeBadge(e.type)}`}>{e.type}</span>
                  <span className={styles.rowTextMuted}>{e.vendor?.name}</span>
                  <span className={styles.rowTextMuted}>{formatDate(e.date)}</span>
                  <span className={`badge badge-${e.status === 'published' ? 'confirmed' : 'cancelled'}`}>{e.status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'bookings' && (
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <span>Booking Ref</span><span>Event</span><span>Customer</span><span>Amount</span><span>Status</span>
              </div>
              {bookings.map(b => (
                <div key={b._id} className={styles.tableRow}>
                  <span className={styles.monospace}>{b.bookingRef}</span>
                  <span>{b.event?.title}</span>
                  <span>{b.user?.name}</span>
                  <span className={styles.highlightValue}>{formatCurrency(b.totalAmount)}</span>
                  <span className={`badge ${getBookingStatusBadge(b.status)}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

