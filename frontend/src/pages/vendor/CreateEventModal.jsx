import { useState } from 'react';
import { createEvent } from '../../services/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import styles from './CreateEventModal.module.css';

const TYPES = ['movie', 'concert', 'train', 'sports', 'theater', 'other'];
const CATEGORIES = [
  { name: 'VIP', seatsPerRow: 5, rows: ['A', 'B'], price: 2000 },
  { name: 'Premium', seatsPerRow: 8, rows: ['C', 'D', 'E'], price: 1200 },
  { name: 'Standard', seatsPerRow: 10, rows: ['F', 'G', 'H', 'I'], price: 600 },
  { name: 'Economy', seatsPerRow: 10, rows: ['J', 'K'], price: 300 },
];

export default function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', type: 'movie',
    date: '', venue: { name: '', city: '', address: '' },
    image: '', duration: '', artist: '', language: '',
  });
  const [layout, setLayout] = useState(CATEGORIES);
  const [loading, setLoading] = useState(false);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setVenue = (field, val) => setForm(f => ({ ...f, venue: { ...f.venue, [field]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEvent({ ...form, seatLayout: { categories: layout } });
      toast.success('Event created!');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create New Event</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="grid-2">
            <div className="form-group">
              <label>Event Title *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Date & Time *</label>
              <input className="form-input" type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input className="form-input" type="url" placeholder="https://..." value={form.image} onChange={e => set('image', e.target.value)} />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Venue Name *</label>
              <input className="form-input" value={form.venue.name} onChange={e => setVenue('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input className="form-input" value={form.venue.city} onChange={e => setVenue('city', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-input" value={form.venue.address} onChange={e => setVenue('address', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            {form.type === 'movie' && (
              <div className="form-group">
                <label>Duration (mins)</label>
                <input className="form-input" type="number" value={form.duration} onChange={e => set('duration', e.target.value)} />
              </div>
            )}
            {form.type === 'concert' && (
              <div className="form-group">
                <label>Artist</label>
                <input className="form-input" value={form.artist} onChange={e => set('artist', e.target.value)} />
              </div>
            )}
          </div>

          <div>
            <p className={styles.sectionTitle}>Seat Layout</p>
            {layout.map((cat, i) => (
              <div key={cat.name} className={styles.layoutRow}>
                <span className={styles.catLabel}>{cat.name}</span>
                <div className={`form-group ${styles.noMargin}`}>
                  <label className={styles.smallLabel}>Rows</label>
                  <input className={`form-input ${styles.inputDense}`}
                    value={cat.rows.join(',')}
                    onChange={e => {
                      const updated = [...layout];
                      updated[i] = { ...cat, rows: e.target.value.split(',').map(r => r.trim().toUpperCase()) };
                      setLayout(updated);
                    }} />
                </div>
                <div className={`form-group ${styles.noMargin}`}>
                  <label className={styles.smallLabel}>Seats/Row</label>
                  <input className={`form-input ${styles.inputDense}`} type="number"
                    value={cat.seatsPerRow}
                    onChange={e => {
                      const updated = [...layout];
                      updated[i] = { ...cat, seatsPerRow: Number(e.target.value) };
                      setLayout(updated);
                    }} />
                </div>
                <div className={`form-group ${styles.noMargin}`}>
                  <label className={styles.smallLabel}>Price (₹)</label>
                  <input className={`form-input ${styles.inputDense}`} type="number"
                    value={cat.price}
                    onChange={e => {
                      const updated = [...layout];
                      updated[i] = { ...cat, price: Number(e.target.value) };
                      setLayout(updated);
                    }} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.buttonRow}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
