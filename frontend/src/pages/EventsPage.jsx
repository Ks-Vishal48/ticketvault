import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/common/EventCard';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const TYPES = ['', 'movie', 'concert', 'train', 'sports', 'theater', 'other'];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    page: 1,
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await getEvents(params);
      setEvents(res.data.events);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem' }}>Browse Events</h1>

        {/* Filters */}
        <div style={styles.filterBar}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <Search size={16} color="#4b5563" />
            <input
              className="form-input"
              style={{ paddingLeft: '2.5rem', flex: 1, background: 'none', border: 'none' }}
              placeholder="Search events..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </form>

          <select className="form-input" style={{ width: 'auto' }}
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}>
            {TYPES.map(t => <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All Types'}</option>)}
          </select>

          <input className="form-input" style={{ width: '160px' }} placeholder="City"
            value={filters.city}
            onChange={e => setFilters(f => ({ ...f, city: e.target.value, page: 1 }))} />
        </div>

        <p style={{ color: '#8892a4', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {loading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} found`}
        </p>

        <div style={styles.grid}>
          {loading
            ? Array(8).fill(0).map((_, i) => <div key={i} style={styles.skeleton} className="pulse" />)
            : events.length
              ? events.map(event => <EventCard key={event._id} event={event} />)
              : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#8892a4' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</p>
                  <p>No events found. Try adjusting your filters.</p>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={styles.pagination}>
            <button className="btn btn-outline btn-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ color: '#8892a4', fontSize: '0.875rem' }}>Page {filters.page} of {pages}</span>
            <button className="btn btn-outline btn-sm"
              disabled={filters.page >= pages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  filterBar: {
    display: 'flex', gap: '0.75rem', marginBottom: '1.5rem',
    background: '#1a1a2e', border: '1px solid #2a2a4a',
    borderRadius: '12px', padding: '0.5rem',
    flexWrap: 'wrap',
  },
  searchForm: {
    flex: 1, display: 'flex', alignItems: 'center',
    gap: '0.5rem', position: 'relative', minWidth: '200px',
    paddingLeft: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  skeleton: { height: '280px', borderRadius: '12px', background: '#1a1a2e' },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '1rem', marginTop: '2.5rem',
  },
};
