import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, holdSeats, createPaymentIntent, confirmBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/seating/SeatMap';
import { MapPin, Calendar, Clock, Tag } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getEventTypeBadge } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './EventDetailPage.module.css';

// Stripe imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe once outside the component so it's not re-created on every render
const stripePromise = loadStripe('pk_test_51U9ciKH7NeAQjmNDm9nF991hyZDMyblTYKfCcZNFzBwNtsdobyPLnqG2FdZkEcXEzK3DP0r5PvS4BJDK4qrEcfgH00m7dKuD93');

// Card element styling to match the dark theme
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#e2e8f0',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#4a5568' },
      iconColor: '#6c63ff',
    },
    invalid: {
      color: '#fc8181',
      iconColor: '#fc8181',
    },
  },
};

// Inner form — must be a child of <Elements> to access useStripe/useElements
function StripeCheckoutForm({ selectedSeats, event, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const totalAmount = selectedSeats.reduce((sum, sn) => {
    const seat = event.seats.find(s => s.seatNumber === sn);
    return sum + (seat?.price || 0);
  }, 0);

  const handlePay = async (e) => {
    e.preventDefault();

    setProcessing(true);
    setCardError('');

    try {
      // Step 1: Ask backend to create a PaymentIntent and get clientSecret
      const res = await createPaymentIntent({ eventId: event._id, seatNumbers: selectedSeats });
      const { clientSecret, paymentIntentId } = res.data;

      // Handle demo mode: backend returns demo_secret_ / demo_ ID
      if (clientSecret?.startsWith('demo_secret_') || !stripe || !elements) {
        const bookingRes = await confirmBooking({
          eventId: event._id,
          seatNumbers: selectedSeats,
          paymentIntentId: paymentIntentId || ('demo_' + Date.now()),
        });
        toast.success('Booking confirmed! (Demo Mode)');
        onSuccess(bookingRes.data);
        return;
      }

      // Step 2: Confirm the card payment with Stripe directly from the browser
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not loaded');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        // Stripe declined or card error
        setCardError(error.message);
        toast.error(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 3: Tell backend payment went through
        const bookingRes = await confirmBooking({ eventId: event._id, seatNumbers: selectedSeats, paymentIntentId });
        toast.success('Booking confirmed!');
        onSuccess(bookingRes.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className={styles.checkoutForm}>
      <h3 className={styles.sectionTitle}>Payment</h3>
      <div className={styles.summary}>
        <p>Selected Seats: {selectedSeats.join(', ')}</p>
        <p className={styles.totalAmount}>Total: {formatCurrency(totalAmount)}</p>
      </div>

      {/* Real Stripe card input — handles card number, expiry, CVC */}
      <div className={styles.cardElementWrapper}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {/* Show inline card errors (wrong CVC, expired card, etc.) */}
      {cardError && (
        <p style={{ color: '#fc8181', fontSize: '0.85rem', margin: 0 }}>{cardError}</p>
      )}

      <button
        className={`btn btn-primary ${styles.paymentButton}`}
        disabled={!stripe || processing}
      >
        {processing ? <><span className="spinner" /> Processing...</> : `Pay ${formatCurrency(totalAmount)}`}
      </button>
      <p className={styles.paymentDisclaimer}>
        🔒 Secured by Stripe. Use test card: 4242 4242 4242 4242 · 12/29 · 123
      </p>
    </form>
  );
}

// Wrapper that provides Stripe context to the inner form
function CheckoutForm({ selectedSeats, event, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm selectedSeats={selectedSeats} event={event} onSuccess={onSuccess} />
    </Elements>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEventById(id);
      setEvent(res.data);
    } catch {
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatToggle = (seat) => {
    setSelectedSeats(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    if (selectedSeats.length === 0) return toast.error('Please select at least one seat');
    try {
      await holdSeats(event._id, selectedSeats);
      setCheckingOut(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not hold seats');
    }
  };

  if (loading) return <div className="page-loader"><div className={`spinner ${styles.spinnerSmall}`} /></div>;
  if (!event) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            <span className={`badge ${getEventTypeBadge(event.type)}`}>
              {event.type}
            </span>
            <h1 className={styles.title}>{event.title}</h1>
            <p className={styles.desc}>{event.description}</p>
            <div className={styles.metaRow}>
              <span><Calendar size={16} /> {formatDate(event.date)} at {formatTime(event.date)}</span>
              <span><MapPin size={16} /> {event.venue?.name}, {event.venue?.city}</span>
              {event.duration && <span><Clock size={16} /> {event.duration} mins</span>}
            </div>
          </div>
        </div>

        <div className={`grid-2 ${styles.gridTwo}`}>
          <div className="card">
            <h2 className={styles.cardHeader}>
              <Tag size={20} /> Select Seats
            </h2>
            <SeatMap
              event={event}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              currentUserId={user?._id}
            />
          </div>

          <div className={styles.stickyPanel}>
            {!checkingOut ? (
              <div className="card">
                <h3>Booking Summary</h3>
                <div className={styles.summarySection}>
                  <p className={styles.summaryText}>
                    {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                  </p>
                  {selectedSeats.map(sn => {
                    const seat = event.seats.find(s => s.seatNumber === sn);
                    return seat ? (
                      <div key={sn} className={styles.seatLine}>
                        <span>{seat.seatNumber} ({seat.category})</span>
                        <span>{formatCurrency(seat.price)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className={`${styles.seatLine} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span className={styles.totalValue}>
                    {formatCurrency(selectedSeats.reduce((sum, sn) => {
                      const seat = event.seats.find(s => s.seatNumber === sn);
                      return sum + (seat?.price || 0);
                    }, 0))}
                  </span>
                </div>
                <button className={`btn btn-primary ${styles.checkoutButton}`}
                  disabled={selectedSeats.length === 0}
                  onClick={handleCheckout}>
                  Proceed to Payment
                </button>
              </div>
            ) : (
              <div className="card">
                <CheckoutForm
                  selectedSeats={selectedSeats}
                  event={event}
                  onSuccess={(bookingData) => {
                    navigate('/booking-success', { state: { booking: bookingData } });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
