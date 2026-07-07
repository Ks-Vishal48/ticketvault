import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeBadge } from '../../utils/helpers';
import styles from './EventCard.module.css';

const EVENT_ICONS = { movie: '🎬', concert: '🎵', train: '🚆', sports: '⚽', theater: '🎭', other: '🎟️' };

export default function EventCard({ event }) {
  const minPrice = event.seats?.length
    ? Math.min(...event.seats.map(s => s.price))
    : 0;

  return (
    <Link to={`/events/${event._id}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.imageBox}>
          {event.image ? (
            <img src={event.image} alt={event.title} className={styles.img} />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>{EVENT_ICONS[event.type] || '🎟️'}</span>
            </div>
          )}
          <span className={`${styles.typeBadge} badge ${getEventTypeBadge(event.type)}`}>
            {event.type}
          </span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{event.title}</h3>
          <div className={styles.meta}>
            <span className={styles.metaItem}><Calendar size={14} /> {formatDate(event.date)}</span>
            <span className={styles.metaItem}><MapPin size={14} /> {event.venue?.city}</span>
            <span className={styles.metaItem}><Users size={14} /> {event.availableSeats} seats left</span>
          </div>
          <div className={styles.footer}>
            <span className={styles.price}>From {formatCurrency(minPrice)}</span>
            <span className={styles.cta}>Book Now →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
