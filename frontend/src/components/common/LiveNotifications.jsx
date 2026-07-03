import { useEffect } from 'react';
import toast from 'react-hot-toast';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

/**
 * Mounted globally – listens for user-level socket events
 * (booking cancelled, refund notifications, etc.)
 */
export default function LiveNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const handleCancelled = ({ bookingRef, refundAmount }) => {
      toast(
        `Booking ${bookingRef} cancelled. Refund of ₹${refundAmount?.toLocaleString('en-IN')} initiated.`,
        { icon: '🔄', duration: 6000 }
      );
    };

    socket.on('bookingCancelled', handleCancelled);
    return () => socket.off('bookingCancelled', handleCancelled);
  }, [user]);

  return null;
}
