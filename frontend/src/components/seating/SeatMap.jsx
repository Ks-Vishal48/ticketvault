import { useState, useEffect } from 'react';
import socket from '../../services/socket';
import { formatCurrency } from '../../utils/helpers';

const SEAT_COLORS = {
  available: { bg: '#1e293b', border: '#334155', color: '#94a3b8' },
  selected: { bg: '#6c63ff', border: '#6c63ff', color: '#fff' },
  booked: { bg: '#1f2937', border: '#374151', color: '#4b5563' },
  held: { bg: '#d97706', border: '#d97706', color: '#fff' },
  VIP: { available: '#1a0f3a', border: '#7c3aed' },
  Premium: { available: '#0f1f3a', border: '#0284c7' },
  Standard: { available: '#0f1f1f', border: '#059669' },
  Economy: { available: '#1f1a0f', border: '#d97706' },
};

export default function SeatMap({ event, selectedSeats, onSeatToggle, currentUserId }) {
  const [seats, setSeats] = useState(event?.seats || []);

  useEffect(() => {
    if (!event?._id) return;
    socket.emit('joinEvent', event._id);

    const handleUpdate = (data) => {
      if (data.eventId === event._id) {
        setSeats(data.seats);
      }
    };
    socket.on('seatsUpdated', handleUpdate);
    return () => {
      socket.off('seatsUpdated', handleUpdate);
    };
  }, [event?._id]);

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const row = seat.row || 'A';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  // Group by category for legend
  const categories = [...new Set(seats.map(s => s.category))];

  const getSeatStatus = (seat) => {
    if (seat.isBooked) return 'booked';
    if (seat.isHeld && seat.heldBy?.toString() !== currentUserId?.toString()) return 'held';
    if (selectedSeats.includes(seat.seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatStyle = (seat, status) => {
    const base = {
      width: 34, height: 34,
      border: '2px solid',
      borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.65rem', fontWeight: '600',
      cursor: status === 'booked' || status === 'held' ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s',
      userSelect: 'none',
    };
    if (status === 'booked') return { ...base, background: '#1f2937', borderColor: '#374151', color: '#4b5563' };
    if (status === 'held') return { ...base, background: '#92400e', borderColor: '#d97706', color: '#fbbf24' };
    if (status === 'selected') return { ...base, background: '#6c63ff', borderColor: '#8b84ff', color: '#fff', transform: 'scale(1.1)', boxShadow: '0 0 12px #6c63ff88' };
    // Available – tint by category
    const catColors = {
      VIP: { bg: '#2d1b6b', border: '#7c3aed', color: '#c4b5fd' },
      Premium: { bg: '#0c2d4a', border: '#0284c7', color: '#7dd3fc' },
      Standard: { bg: '#0c2d1e', border: '#059669', color: '#6ee7b7' },
      Economy: { bg: '#2d2006', border: '#d97706', color: '#fcd34d' },
    };
    const c = catColors[seat.category] || catColors.Standard;
    return { ...base, background: c.bg, borderColor: c.border, color: c.color };
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Screen/Stage indicator */}
      <div style={styles.screen}>
        <div style={styles.screenBar} />
        <p style={styles.screenLabel}>SCREEN / STAGE</p>
      </div>

      {/* Seat grid */}
      <div style={styles.grid}>
        {Object.entries(rows).map(([row, rowSeats]) => (
          <div key={row} style={styles.row}>
            <span style={styles.rowLabel}>{row}</span>
            <div style={styles.rowSeats}>
              {rowSeats.map(seat => {
                const status = getSeatStatus(seat);
                return (
                  <button
                    key={seat.seatNumber}
                    title={`${seat.seatNumber} • ${seat.category} • ${formatCurrency(seat.price)}`}
                    style={getSeatStyle(seat, status)}
                    onClick={() => status !== 'booked' && status !== 'held' && onSeatToggle(seat)}
                    disabled={status === 'booked' || status === 'held'}
                  >
                    {seat.seatNumber.replace(row, '')}
                  </button>
                );
              })}
            </div>
            <span style={styles.rowLabel}>{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {[
          { label: 'Available', color: '#0c2d1e', border: '#059669' },
          { label: 'Selected', color: '#6c63ff', border: '#8b84ff' },
          { label: 'Booked', color: '#1f2937', border: '#374151' },
          { label: 'Held', color: '#92400e', border: '#d97706' },
        ].map(item => (
          <div key={item.label} style={styles.legendItem}>
            <div style={{ ...styles.legendSwatch, background: item.color, borderColor: item.border }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Category pricing */}
      {categories.length > 0 && (
        <div style={styles.catPricing}>
          {categories.map(cat => {
            const catSeats = seats.filter(s => s.category === cat);
            const price = catSeats[0]?.price || 0;
            const available = catSeats.filter(s => !s.isBooked).length;
            return (
              <div key={cat} style={styles.catItem}>
                <span style={styles.catName}>{cat}</span>
                <span style={styles.catPrice}>{formatCurrency(price)}</span>
                <span style={styles.catAvail}>{available} left</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: { textAlign: 'center', marginBottom: '2rem' },
  screenBar: {
    height: '8px', borderRadius: '4px 4px 0 0',
    background: 'linear-gradient(90deg, transparent, #6c63ff, transparent)',
    marginBottom: '6px',
  },
  screenLabel: { fontSize: '0.7rem', color: '#4b5563', letterSpacing: '0.2em' },
  grid: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' },
  row: { display: 'flex', alignItems: 'center', gap: '8px' },
  rowLabel: { width: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#4b5563', fontWeight: '600' },
  rowSeats: { display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' },
  legend: {
    display: 'flex', gap: '1.5rem', marginTop: '2rem',
    justifyContent: 'center', flexWrap: 'wrap',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' },
  legendSwatch: { width: 16, height: 16, borderRadius: 3, border: '2px solid' },
  catPricing: {
    display: 'flex', gap: '1rem', marginTop: '1.5rem',
    justifyContent: 'center', flexWrap: 'wrap',
  },
  catItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    background: '#16213e', borderRadius: '8px',
    padding: '0.5rem 1rem', fontSize: '0.8rem',
  },
  catName: { color: '#94a3b8', fontWeight: '600' },
  catPrice: { color: '#6c63ff', fontWeight: '700' },
  catAvail: { color: '#4b5563', fontSize: '0.75rem' },
};
