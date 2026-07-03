import { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Calendar, MapPin, X } from 'lucide-react';
import { formatDate, formatCurrency, getBookingStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getUserBookings();
      setBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? Refund will be processed automatically.')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled. Refund initiated.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Welcome, {user.name}!
        </h1>
        <p style={{ color: '#8892a4', marginBottom: '2rem' }}>Your bookings and account info</p>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>My Bookings</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎟️</p>
              <p style={{ color: '#8892a4' }}>No bookings yet. Start exploring events!</p>
              <a href="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Events</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map(booking => (
                <div key={booking._id} className="card" style={styles.bookingCard}>
                  <div style={styles.bookingMain}>
                    <div style={styles.bookingIcon}><Ticket size={24} color="#6c63ff" /></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{booking.event?.title}</h3>
                      <p style={{ color: '#8892a4', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                        <Calendar size={14} /> {formatDate(booking.event?.date)}
                      </p>
                      <p style={{ color: '#8892a4', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {booking.event?.venue?.name}, {booking.event?.venue?.city}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${getBookingStatusBadge(booking.status)}`}>{booking.status}</span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#8892a4' }}>Booking ID: {booking.bookingRef}</p>
                      <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#6c63ff', marginTop: '0.25rem' }}>
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #2a2a4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Seats: {booking.seats.map(s => s.seatNumber).join(', ')}
                    </p>
                    {booking.status === 'confirmed' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(booking._id)}>
                        <X size={14} /> Cancel Booking
                      </button>
                    )}
                  </div>
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
  bookingCard: { display: 'flex', flexDirection: 'column' },
  bookingMain: { display: 'flex', alignItems: 'start', gap: '1rem' },
  bookingIcon: {
    width: 48, height: 48, borderRadius: '10px',
    background: '#16213e', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
