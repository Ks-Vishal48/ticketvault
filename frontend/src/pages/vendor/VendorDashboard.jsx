import { useState, useEffect } from 'react';
import { getVendorEvents, deleteEvent, getVendorBookings } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Ticket, Calendar, Users, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeBadge, getBookingStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import CreateEventModal from './CreateEventModal';
import styles from './VendorDashboard.module.css';

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
    <div className={styles.pageWrapper}>
      <div className="container">
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Vendor Dashboard</h1>
            <p className={styles.subtitle}>Manage your events & track bookings</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create Event
          </button>
        </div>

        {/* Stats */}
        <div className={`grid-4 ${styles.statsGrid}`}>
          {[
            { label: 'Total Events', value: events.length, icon: <Calendar size={22} color="#6c63ff" />, iconClass: styles.statEventsIcon },
            { label: 'Total Bookings', value: bookings.length, icon: <Ticket size={22} color="#22c55e" />, iconClass: styles.statBookingsIcon },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign size={22} color="#f59e0b" />, iconClass: styles.statRevenueIcon },
            { label: 'Active Events', value: events.filter(e => e.status === 'published').length, icon: <Users size={22} color="#06b6d4" />, iconClass: styles.statActiveIcon },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <div className={`stat-icon ${stat.iconClass}`}>{stat.icon}</div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['events', 'bookings'].map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.centerCard}><div className="spinner" /></div>
        ) : tab === 'events' ? (
          <div className={styles.eventList}>
            {events.length === 0 ? (
              <div className={`card ${styles.centerCard}`}>
                <p>No events yet. Create your first event!</p>
              </div>
            ) : events.map(event => (
              <div key={event._id} className={`card ${styles.eventRow}`}>
                <div className={styles.eventMeta}>
                  <div className={styles.eventHeader}>
                    <h3>{event.title}</h3>
                    <span className={`badge ${getEventTypeBadge(event.type)}`}>{event.type}</span>
                  </div>
                  <p className={styles.eventSubtitle}>
                    {formatDate(event.date)} · {event.venue?.city} · {event.availableSeats}/{event.totalSeats} seats available
                  </p>
                </div>
                <div className={styles.eventActions}>
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
          <div className={styles.sectionSpacing}>
            {bookings.length === 0 ? (
              <div className={`card ${styles.centerCard}`}>
                <p>No bookings yet.</p>
              </div>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <span>Event</span><span>Customer</span><span>Seats</span><span>Amount</span><span>Status</span>
                </div>
                {bookings.map(b => (
                  <div key={b._id} className={styles.tableRow}>
                    <span>{b.event?.title}</span>
                    <span>{b.user?.name}</span>
                    <span>{b.seats?.length}</span>
                    <span className={styles.highlightValue}>{formatCurrency(b.totalAmount)}</span>
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
