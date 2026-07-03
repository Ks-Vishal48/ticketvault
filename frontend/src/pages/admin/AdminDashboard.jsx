import { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers, getAdminEvents, toggleUserStatus, updateUserRole, getAllBookings } from '../../services/api';
import { Users, Ticket, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeBadge, getBookingStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

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

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Admin Dashboard</h1>
          <p style={{ color: '#8892a4' }}>Platform overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Users', value: stats?.totalUsers, icon: <Users size={22} color="#6c63ff" />, bg: '#6c63ff22' },
            { label: 'Total Events', value: stats?.totalEvents, icon: <Calendar size={22} color="#22c55e" />, bg: '#22c55e22' },
            { label: 'Total Bookings', value: stats?.totalBookings, icon: <Ticket size={22} color="#06b6d4" />, bg: '#06b6d422' },
            { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue), icon: <DollarSign size={22} color="#f59e0b" />, bg: '#f59e0b22' },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg }}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value ?? '—'}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'users', 'events', 'bookings'].map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {tab === 'overview' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Recent Bookings</h3>
              <div style={styles.table}>
                <div style={{ ...styles.tableRow, background: '#16213e', fontWeight: '600', fontSize: '0.8rem', color: '#8892a4' }}>
                  <span>Event</span><span>Customer</span><span>Amount</span><span>Status</span><span>Date</span>
                </div>
                {(stats?.recentBookings || []).map(b => (
                  <div key={b._id} style={styles.tableRow}>
                    <span>{b.event?.title}</span>
                    <span>{b.user?.name}</span>
                    <span style={{ color: '#6c63ff' }}>{formatCurrency(b.totalAmount)}</span>
                    <span className={`badge ${getBookingStatusBadge(b.status)}`}>{b.status}</span>
                    <span style={{ fontSize: '0.8rem', color: '#8892a4' }}>{formatDate(b.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div style={styles.table}>
              <div style={{ ...styles.tableRow, ...styles.userRow, background: '#16213e', fontWeight: '600', fontSize: '0.8rem', color: '#8892a4' }}>
                <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
              </div>
              {users.map(u => (
                <div key={u._id} style={{ ...styles.tableRow, ...styles.userRow }}>
                  <span>{u.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8892a4' }}>{u.email}</span>
                  <select
                    style={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: '6px', color: '#e2e8f0', padding: '0.3rem', fontSize: '0.8rem' }}
                    value={u.role}
                    onChange={e => handleRoleChange(u._id, e.target.value)}>
                    {['customer', 'vendor', 'admin'].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <span style={{ color: u.isActive ? '#22c55e' : '#ef4444', fontSize: '0.85rem' }}>
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
            <div style={styles.table}>
              <div style={{ ...styles.tableRow, background: '#16213e', fontWeight: '600', fontSize: '0.8rem', color: '#8892a4' }}>
                <span>Title</span><span>Type</span><span>Vendor</span><span>Date</span><span>Status</span>
              </div>
              {events.map(e => (
                <div key={e._id} style={styles.tableRow}>
                  <span>{e.title}</span>
                  <span className={`badge ${getEventTypeBadge(e.type)}`}>{e.type}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8892a4' }}>{e.vendor?.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#8892a4' }}>{formatDate(e.date)}</span>
                  <span className={`badge badge-${e.status === 'published' ? 'confirmed' : 'cancelled'}`}>{e.status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'bookings' && (
            <div style={styles.table}>
              <div style={{ ...styles.tableRow, background: '#16213e', fontWeight: '600', fontSize: '0.8rem', color: '#8892a4' }}>
                <span>Booking Ref</span><span>Event</span><span>Customer</span><span>Amount</span><span>Status</span>
              </div>
              {bookings.map(b => (
                <div key={b._id} style={styles.tableRow}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.bookingRef}</span>
                  <span>{b.event?.title}</span>
                  <span>{b.user?.name}</span>
                  <span style={{ color: '#6c63ff' }}>{formatCurrency(b.totalAmount)}</span>
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

const styles = {
  tabs: { display: 'flex', gap: '0.5rem', borderBottom: '1px solid #2a2a4a' },
  tab: {
    padding: '0.6rem 1.25rem', background: 'none', border: 'none',
    color: '#8892a4', cursor: 'pointer', borderBottom: '2px solid transparent',
    fontSize: '0.9rem', fontWeight: '500', marginBottom: '-1px',
  },
  tabActive: { color: '#6c63ff', borderBottomColor: '#6c63ff' },
  table: { background: '#1a1a2e', borderRadius: '12px', border: '1px solid #2a2a4a', overflow: 'hidden' },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    padding: '0.75rem 1rem', borderTop: '1px solid #2a2a4a',
    fontSize: '0.85rem', alignItems: 'center', gap: '1rem',
  },
  userRow: { gridTemplateColumns: '1.5fr 2fr 1fr 0.75fr 1.25fr' },
};
