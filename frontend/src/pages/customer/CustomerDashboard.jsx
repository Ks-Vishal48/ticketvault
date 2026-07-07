import { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Calendar, MapPin, X } from 'lucide-react';
import { formatDate, formatCurrency, getBookingStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './CustomerDashboard.module.css';

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
    <div className={styles.pageWrapper}>
      <div className="container">
        <h1 className={styles.title}>
          Welcome, {user.name}!
        </h1>
        <p className={styles.subtitle}>Your bookings and account info</p>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>My Bookings</h2>
          {loading ? (
            <div className={styles.centerCard}><div className="spinner" /></div>
          ) : bookings.length === 0 ? (
            <div className={`card ${styles.centerCard}`}>
              <p className={styles.emptyEmoji}>🎟️</p>
              <p className={styles.emptyText}>No bookings yet. Start exploring events!</p>
              <a href="/events" className={`btn btn-primary ${styles.browseButton}`}>Browse Events</a>
            </div>
          ) : (
            <div className={styles.bookingList}>
              {bookings.map(booking => (
                <div key={booking._id} className={`card ${styles.bookingCard}`}>
                  <div className={styles.bookingMain}>
                    <div className={styles.bookingIcon}><Ticket size={24} color="#6c63ff" /></div>
                    <div className={styles.bookingInfo}>
                      <h3 className={styles.bookingTitle}>{booking.event?.title}</h3>
                      <p className={styles.bookingMeta}>
                        <Calendar size={14} /> {formatDate(booking.event?.date)}
                      </p>
                      <p className={styles.bookingMeta}>
                        <MapPin size={14} /> {booking.event?.venue?.name}, {booking.event?.venue?.city}
                      </p>
                    </div>
                    <div className={styles.bookingSummaryRight}>
                      <span className={`badge ${getBookingStatusBadge(booking.status)}`}>{booking.status}</span>
                      <p className={styles.bookingRef}>Booking ID: {booking.bookingRef}</p>
                      <p className={styles.bookingAmount}>
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.bookingSummary}>
                    <p className={styles.bookingMeta}>
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
