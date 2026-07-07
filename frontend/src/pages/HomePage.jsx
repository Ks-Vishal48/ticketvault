import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/common/EventCard';
import { Search, ChevronRight, Zap, Shield, RefreshCw } from 'lucide-react';
import styles from './HomePage.module.css';

const EVENT_TYPES = ['all', 'movie', 'concert', 'train', 'sports', 'theater', 'other'];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [activeType]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { limit: 8 };
      if (activeType !== 'all') params.type = activeType;
      const res = await getEvents(params);
      setEvents(res.data.events);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/events?search=${search}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>
            Book Your Next <br />
            <span className={styles.highlight}>Experience</span>
          </h1>
          <p className={styles.heroSub}>
            Movies, concerts, trains, sports & more — all in one place. Real-time seat selection.
          </p>

          <form onSubmit={handleSearch} className={styles.searchBar}>
            <Search size={20} color="#4b5563" />
            <input
              className={styles.searchInput}
              placeholder="Search events, artists, venues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>

          <div className={styles.statsBand}>
            {[{ v: '500+', l: 'Events Live' }, { v: '50K+', l: 'Tickets Sold' }, { v: '200+', l: 'Venues' }, { v: '4.9★', l: 'Rating' }].map(s => (
              <div key={s.l}>
                <div className={styles.statVal}>{s.v}</div>
                <div className={styles.statLbl}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroBg} />
      </section>

      {/* Type filter */}
      <section className={styles.sectionPadding}>
        <div className="container">
          <div className={styles.typeFilter}>
            {EVENT_TYPES.map(t => (
              <button key={t}
                className={`${styles.typeBtn} ${activeType === t ? styles.typeBtnActive : ''}`}
                onClick={() => setActiveType(t)}>
                {t === 'all' ? '🎟️ All' : t === 'movie' ? '🎬 Movies' : t === 'concert' ? '🎵 Concerts' :
                  t === 'train' ? '🚆 Trains' : t === 'sports' ? '⚽ Sports' : t === 'theater' ? '🎭 Theater' : '🎪 Other'}
              </button>
            ))}
          </div>

          <div className={styles.cardsGrid}>
            {loading
              ? Array(6).fill(0).map((_, i) => <div key={i} className={`${styles.skeleton} pulse`} />)
              : events.length
                ? events.map(event => <EventCard key={event._id} event={event} />)
                : <p className={styles.noEvents}>No events found.</p>
            }
          </div>

          {events.length > 0 && (
            <div className={styles.ctaCenter}>
              <Link to="/events" className="btn btn-outline">
                View All Events <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why TicketVault?</h2>
          <div className={`grid-3 ${styles.featureGrid}`}>
            {[
              { icon: <Zap size={24} color="#6c63ff" />, title: 'Real-time Seats', desc: 'Live seat availability updates. See what others are selecting instantly.' },
              { icon: <Shield size={24} color="#22c55e" />, title: 'Secure Payments', desc: 'Powered by Stripe. Your payment info is always safe and encrypted.' },
              { icon: <RefreshCw size={24} color="#f59e0b" />, title: 'Easy Cancellations', desc: 'Cancel anytime and get instant refunds right back to your account.' },
            ].map(f => (
              <div key={f.title} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

