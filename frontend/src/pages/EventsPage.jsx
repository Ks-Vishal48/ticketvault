import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/common/EventCard';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './EventsPage.module.css';

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
    <div className={styles.pageWrapper}>
      <div className="container">
        <h1 className={styles.title}>Browse Events</h1>

        {/* Filters */}
        <div className={styles.filterBar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Search size={16} color="#4b5563" />
            <input
              className={`form-input ${styles.searchInput}`}
              placeholder="Search events..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </form>

          <select className={`form-input ${styles.selectAuto}`}
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}>
            {TYPES.map(t => <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All Types'}</option>)}
          </select>

          <input className={`form-input ${styles.cityInput}`} placeholder="City"
            value={filters.city}
            onChange={e => setFilters(f => ({ ...f, city: e.target.value, page: 1 }))} />
        </div>

        <p className={styles.summaryText}>
          {loading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} found`}
        </p>

        <div className={styles.grid}>
          {loading
            ? Array(8).fill(0).map((_, i) => <div key={i} className={`${styles.skeleton} pulse`} />)
            : events.length
              ? events.map(event => <EventCard key={event._id} event={event} />)
              : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateTitle}>🎟️</p>
                  <p>No events found. Try adjusting your filters.</p>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-outline btn-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft size={16} /> Prev
            </button>
            <span className={styles.paginationText}>Page {filters.page} of {pages}</span>
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
