import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

export const getEventTypeBadge = (type) => {
  const map = {
    movie: 'badge-movie',
    concert: 'badge-concert',
    train: 'badge-train',
    sports: 'badge-sports',
    theater: 'badge-theater',
    other: 'badge-other',
  };
  return map[type] || 'badge-other';
};

export const getBookingStatusBadge = (status) => {
  const map = {
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
    pending: 'badge-pending',
    refunded: 'badge-refunded',
  };
  return map[status] || 'badge-pending';
};
