import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/common/EventCard';
import { Search, ChevronRight, Zap, Shield, RefreshCw } from 'lucide-react';

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
      <section style={styles.hero}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={styles.heroTitle}>
            Book Your Next <br />
            <span style={{ color: '#6c63ff' }}>Experience</span>
          </h1>
          <p style={styles.heroSub}>
            Movies, concerts, trains, sports & more — all in one place. Real-time seat selection.
          </p>

          <form onSubmit={handleSearch} style={styles.searchBar}>
            <Search size={20} color="#4b5563" />
            <input
              style={styles.searchInput}
              placeholder="Search events, artists, venues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>

          <div style={styles.statsBand}>
            {[{ v: '500+', l: 'Events Live' }, { v: '50K+', l: 'Tickets Sold' }, { v: '200+', l: 'Venues' }, { v: '4.9★', l: 'Rating' }].map(s => (
              <div key={s.l} style={styles.statItem}>
                <div style={styles.statVal}>{s.v}</div>
                <div style={styles.statLbl}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.heroBg} />
      </section>

      {/* Type filter */}
      <section style={{ padding: '3rem 0 1rem' }}>
        <div className="container">
          <div style={styles.typeFilter}>
            {EVENT_TYPES.map(t => (
              <button key={t}
                style={{ ...styles.typeBtn, ...(activeType === t ? styles.typeBtnActive : {}) }}
                onClick={() => setActiveType(t)}>
                {t === 'all' ? '🎟️ All' : t === 'movie' ? '🎬 Movies' : t === 'concert' ? '🎵 Concerts' :
                  t === 'train' ? '🚆 Trains' : t === 'sports' ? '⚽ Sports' : t === 'theater' ? '🎭 Theater' : '🎪 Other'}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {loading
              ? Array(6).fill(0).map((_, i) => <div key={i} style={styles.skeleton} className="pulse" />)
              : events.length
                ? events.map(event => <EventCard key={event._id} event={event} />)
                : <p style={{ color: '#8892a4', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No events found.</p>
            }
          </div>

          {events.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/events" className="btn btn-outline">
                View All Events <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Why TicketVault?</h2>
          <div className="grid-3" style={{ marginTop: '2rem' }}>
            {[
              { icon: <Zap size={24} color="#6c63ff" />, title: 'Real-time Seats', desc: 'Live seat availability updates. See what others are selecting instantly.' },
              { icon: <Shield size={24} color="#22c55e" />, title: 'Secure Payments', desc: 'Powered by Stripe. Your payment info is always safe and encrypted.' },
              { icon: <RefreshCw size={24} color="#f59e0b" />, title: 'Easy Cancellations', desc: 'Cancel anytime and get instant refunds right back to your account.' },
            ].map(f => (
              <div key={f.title} className="card" style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#8892a4', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative', overflow: 'hidden',
    padding: '5rem 0 3rem',
    background: 'linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(circle at 30% 40%, #6c63ff22, transparent 50%), radial-gradient(circle at 70% 60%, #ff658422, transparent 50%)',
    pointerEvents: 'none',
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', lineHeight: 1.2, marginBottom: '1rem' },
  heroSub: { color: '#8892a4', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem', lineHeight: 1.6 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#1a1a2e', border: '1px solid #2a2a4a',
    borderRadius: '12px', padding: '0.5rem 0.5rem 0.5rem 1rem',
    maxWidth: '560px',
  },
  searchInput: {
    flex: 1, background: 'none', border: 'none',
    color: '#e2e8f0', fontSize: '0.95rem', outline: 'none',
  },
  statsBand: {
    display: 'flex', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap',
  },
  statItem: {},
  statVal: { fontSize: '1.5rem', fontWeight: '700', color: '#6c63ff' },
  statLbl: { fontSize: '0.8rem', color: '#8892a4', marginTop: '2px' },
  typeFilter: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  typeBtn: {
    padding: '0.5rem 1rem', borderRadius: '20px',
    border: '1px solid #2a2a4a', background: 'none',
    color: '#8892a4', fontSize: '0.875rem', cursor: 'pointer',
    transition: 'all 0.2s',
  },
  typeBtnActive: { background: '#6c63ff', borderColor: '#6c63ff', color: '#fff' },
  skeleton: { height: '280px', borderRadius: '12px', background: '#1a1a2e' },
  features: { padding: '4rem 0', background: '#16213e22' },
  sectionTitle: { fontSize: '1.8rem', fontWeight: '700', textAlign: 'center' },
  featureCard: { textAlign: 'center', padding: '2rem' },
  featureIcon: {
    width: '56px', height: '56px', borderRadius: '14px',
    background: '#16213e', margin: '0 auto 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
