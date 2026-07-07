import { useState, useEffect } from 'react';
import socket from '../../services/socket';
import { formatCurrency } from '../../utils/helpers';
import styles from './SeatMap.module.css';

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

  const getSeatClass = (seat, status) => {
    if (status === 'booked') return styles.seatBooked;
    if (status === 'held') return styles.seatHeld;
    if (status === 'selected') return styles.seatSelected;
    const categoryClass = {
      VIP: styles.seatVIP,
      Premium: styles.seatPremium,
      Standard: styles.seatStandard,
      Economy: styles.seatEconomy,
    };
    return categoryClass[seat.category] || styles.seatStandard;
  };

  return (
    <div className={styles.overflowXAuto}>
      {/* Screen/Stage indicator */}
      <div className={styles.screen}>
        <div className={styles.screenBar} />
        <p className={styles.screenLabel}>SCREEN / STAGE</p>
      </div>

      {/* Seat grid */}
      <div className={styles.grid}>
        {Object.entries(rows).map(([row, rowSeats]) => (
          <div key={row} className={styles.row}>
            <span className={styles.rowLabel}>{row}</span>
            <div className={styles.rowSeats}>
              {rowSeats.map(seat => {
                const status = getSeatStatus(seat);
                return (
                  <button
                    key={seat.seatNumber}
                    title={`${seat.seatNumber} • ${seat.category} • ${formatCurrency(seat.price)}`}
                    className={`${styles.seatButton} ${getSeatClass(seat, status)}`}
                    onClick={() => status !== 'booked' && status !== 'held' && onSeatToggle(seat)}
                    disabled={status === 'booked' || status === 'held'}
                  >
                    {seat.seatNumber.replace(row, '')}
                  </button>
                );
              })}
            </div>
            <span className={styles.rowLabel}>{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {[
          { label: 'Available', swatchClass: styles.legendAvailable },
          { label: 'Selected', swatchClass: styles.legendSelected },
          { label: 'Booked', swatchClass: styles.legendBooked },
          { label: 'Held', swatchClass: styles.legendHeld },
        ].map(item => (
          <div key={item.label} className={styles.legendItem}>
            <div className={`${styles.legendSwatch} ${item.swatchClass}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Category pricing */}
      {categories.length > 0 && (
        <div className={styles.catPricing}>
          {categories.map(cat => {
            const catSeats = seats.filter(s => s.category === cat);
            const price = catSeats[0]?.price || 0;
            const available = catSeats.filter(s => !s.isBooked).length;
            return (
              <div key={cat} className={styles.catItem}>
                <span className={styles.catName}>{cat}</span>
                <span className={styles.catPrice}>{formatCurrency(price)}</span>
                <span className={styles.catAvail}>{available} left</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
