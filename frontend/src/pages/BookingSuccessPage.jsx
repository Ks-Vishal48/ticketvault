import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Ticket, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  // Auto redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate('/customer'), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!booking) {
    // If someone navigates here directly without booking data
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <CheckCircle size={64} color="#22c55e" />
          <h1 style={styles.title}>Booking Confirmed!</h1>
          <p style={styles.sub}>Your booking was successful.</p>
          <Link to="/customer" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        {/* Success Icon */}
        <div style={styles.iconWrapper}>
          <CheckCircle size={64} color="#22c55e" />
        </div>

        <h1 style={styles.title}>Booking Confirmed!</h1>
        <p style={styles.sub}>Your tickets have been booked successfully.</p>

        {/* Booking Reference */}
        <div style={styles.refBox}>
          <p style={styles.refLabel}>Booking Reference</p>
          <p style={styles.refValue}>{booking.bookingRef}</p>
        </div>

        {/* Event Details */}
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <Ticket size={16} style={{ color: '#6c63ff' }} />
            <span>{booking.event?.title}</span>
          </div>
          <div style={styles.detailRow}>
            <Calendar size={16} style={{ color: '#6c63ff' }} />
            <span>{formatDate(booking.event?.date)}</span>
          </div>
          <div style={styles.detailRow}>
            <MapPin size={16} style={{ color: '#6c63ff' }} />
            <span>{booking.event?.venue?.name}, {booking.event?.venue?.city}</span>
          </div>
        </div>

        {/* Seats */}
        <div style={styles.seatsBox}>
          <p style={styles.seatsLabel}>Seats Booked</p>
          <div style={styles.seatsList}>
            {booking.seats?.map(s => (
              <span key={s.seatNumber} style={styles.seatBadge}>
                {s.seatNumber} ({s.category})
              </span>
            ))}
          </div>
        </div>

        {/* Total */}
        <div style={styles.totalRow}>
          <span>Total Paid</span>
          <span style={styles.totalValue}>{formatCurrency(booking.totalAmount)}</span>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <Link to="/customer" className="btn btn-primary">
            View My Bookings <ArrowRight size={16} />
          </Link>
          <Link to="/events" className="btn btn-outline">
            Browse More Events
          </Link>
        </div>

        <p style={styles.autoRedirect}>
          Redirecting to your dashboard in 10 seconds...
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    background: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: '0.5rem',
  },
  sub: {
    color: '#8892a4',
    marginBottom: '1.5rem',
  },
  refBox: {
    background: '#16213e',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  refLabel: {
    fontSize: '0.8rem',
    color: '#8892a4',
    marginBottom: '0.25rem',
  },
  refValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#6c63ff',
    fontFamily: 'monospace',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#e2e8f0',
  },
  seatsBox: {
    marginBottom: '1.5rem',
  },
  seatsLabel: {
    fontSize: '0.8rem',
    color: '#8892a4',
    marginBottom: '0.5rem',
  },
  seatsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    justifyContent: 'center',
  },
  seatBadge: {
    background: '#6c63ff22',
    color: '#a78bfa',
    borderRadius: '20px',
    padding: '0.2rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    borderTop: '1px solid #2a2a4a',
    borderBottom: '1px solid #2a2a4a',
    marginBottom: '1.5rem',
    fontWeight: '600',
  },
  totalValue: {
    color: '#6c63ff',
    fontSize: '1.1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  autoRedirect: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: '#4b5563',
  },
};
