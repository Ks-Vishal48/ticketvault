import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeBadge } from '../../utils/helpers';

const EVENT_ICONS = { movie: '🎬', concert: '🎵', train: '🚆', sports: '⚽', theater: '🎭', other: '🎟️' };

export default function EventCard({ event }) {
  const minPrice = event.seats?.length
    ? Math.min(...event.seats.map(s => s.price))
    : 0;

  return (
    <Link to={`/events/${event._id}`} style={{ textDecoration: 'none' }}>
      <div style={styles.card}>
        <div style={styles.imageBox}>
          {event.image ? (
            <img src={event.image} alt={event.title} style={styles.img} />
          ) : (
            <div style={styles.placeholder}>
              <span style={{ fontSize: '3rem' }}>{EVENT_ICONS[event.type] || '🎟️'}</span>
            </div>
          )}
          <span className={`badge ${getEventTypeBadge(event.type)}`} style={styles.typeBadge}>
            {event.type}
          </span>
        </div>
        <div style={styles.body}>
          <h3 style={styles.title}>{event.title}</h3>
          <div style={styles.meta}>
            <span style={styles.metaItem}><Calendar size={14} /> {formatDate(event.date)}</span>
            <span style={styles.metaItem}><MapPin size={14} /> {event.venue?.city}</span>
            <span style={styles.metaItem}><Users size={14} /> {event.availableSeats} seats left</span>
          </div>
          <div style={styles.footer}>
            <span style={styles.price}>From {formatCurrency(minPrice)}</span>
            <span style={styles.cta}>Book Now →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    background: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  imageBox: { position: 'relative', height: '160px' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #16213e, #0f3460)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute', top: '10px', left: '10px',
    textTransform: 'capitalize',
  },
  body: { padding: '1rem' },
  title: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#e2e8f0' },
  meta: { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    fontSize: '0.8rem', color: '#8892a4',
  },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: '0.95rem', fontWeight: '700', color: '#6c63ff' },
  cta: { fontSize: '0.8rem', color: '#6c63ff', fontWeight: '500' },
};
