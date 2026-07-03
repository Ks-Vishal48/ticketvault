import { useState, useEffect } from 'react';
import { getVendorEvents, deleteEvent, getVendorBookings } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Ticket, Calendar, Users, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeBadge, getBookingStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import CreateEventModal from './CreateEventModal';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('events');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evRes, bookRes] = await Promise.all([getVendorEvents(), getVendorBookings()]);
      setEvents(evRes.data);
      setBookings(bookRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Vendor Dashboard</h1>
            <p style={{ color: '#8892a4' }}>Manage your events & track bookings</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Events', value: events.length, icon: <Calendar size={22} color="#6c63ff" />, bg: '#6c63ff22' },
            { label: 'Total Bookings', value: bookings.length, icon: <Ticket size={22} color="#22c55e" />, bg: '#22c55e22' },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign size={22} color="#f59e0b" />, bg: '#f59e0b22' },
            { label: 'Active Events', value: events.filter(e => e.status === 'published').length, icon: <Users size={22} color="#06b6d4" />, bg: '#06b6d422' },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg }}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['events', 'bookings'].map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
        ) : tab === 'events' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {events.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No events yet. Create your first event!</p>
              </div>
            ) : events.map(event => (
              <div key={event._id} className="card" style={styles.eventRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3>{event.title}</h3>
                    <span className={`badge ${getEventTypeBadge(event.type)}`}>{event.type}</span>
                  </div>
                  <p style={{ color: '#8892a4', fontSize: '0.85rem' }}>
                    {formatDate(event.date)} · {event.venue?.city} · {event.availableSeats}/{event.totalSeats} seats available
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => window.open(`/events/${event._id}`, '_blank')}>
                    View
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {bookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No bookings yet.</p>
              </div>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <span>Event</span><span>Customer</span><span>Seats</span><span>Amount</span><span>Status</span>
                </div>
                {bookings.map(b => (
                  <div key={b._id} style={styles.tableRow}>
                    <span>{b.event?.title}</span>
                    <span>{b.user?.name}</span>
                    <span>{b.seats?.length}</span>
                    <span style={{ color: '#6c63ff' }}>{formatCurrency(b.totalAmount)}</span>
                    <span className={`badge ${getBookingStatusBadge(b.status)}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchData(); }} />
      )}
    </div>
  );
}

const styles = {
  tabs: { display: 'flex', gap: '0.5rem', borderBottom: '1px solid #2a2a4a', paddingBottom: '0' },
  tab: {
    padding: '0.6rem 1.25rem', background: 'none', border: 'none',
    color: '#8892a4', cursor: 'pointer', borderBottom: '2px solid transparent',
    fontSize: '0.9rem', fontWeight: '500', marginBottom: '-1px',
  },
  tabActive: { color: '#6c63ff', borderBottomColor: '#6c63ff' },
  eventRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  table: { display: 'flex', flexDirection: 'column', gap: '0', background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a4a' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 0.5fr 1fr 1fr',
    padding: '0.75rem 1rem', background: '#16213e',
    fontSize: '0.8rem', color: '#8892a4', fontWeight: '600', gap: '1rem',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 0.5fr 1fr 1fr',
    padding: '0.75rem 1rem', borderTop: '1px solid #2a2a4a',
    fontSize: '0.85rem', alignItems: 'center', gap: '1rem',
  },
};
