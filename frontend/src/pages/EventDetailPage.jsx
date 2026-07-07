import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, holdSeats, createPaymentIntent, confirmBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/seating/SeatMap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { MapPin, Calendar, Clock, Tag, Info } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getEventTypeBadge } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './EventDetailPage.module.css';

const stripePromise = loadStripe('pk_test_51PlaceYourPublishableKeyHere');

function CheckoutForm({ selectedSeats, event, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const totalAmount = selectedSeats.reduce((sum, sn) => {
    const seat = event.seats.find(s => s.seatNumber === sn);
    return sum + (seat?.price || 0);
  }, 0);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      // Create payment intent
      const res = await createPaymentIntent({ eventId: event._id, seatNumbers: selectedSeats });
      const { clientSecret, paymentIntentId } = res.data;

      // For demo, skip actual Stripe payment and just confirm booking
      await confirmBooking({ eventId: event._id, seatNumbers: selectedSeats, paymentIntentId });
      toast.success('Booking confirmed!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className={styles.checkoutForm}>
      <h3 className={styles.sectionTitle}>Payment</h3>
      <div className={styles.summary}>
        <p>Selected Seats: {selectedSeats.join(', ')}</p>
        <p className={styles.totalAmount}>
          Total: {formatCurrency(totalAmount)}
        </p>
      </div>
      <div className={styles.cardElementWrapper}>
        <CardElement options={{ style: { base: { color: '#e2e8f0', fontSize: '14px' } } }} />
      </div>
      <button className={`btn btn-primary ${styles.paymentButton}`} disabled={processing || !stripe}>
        {processing ? <><span className="spinner" /> Processing...</> : `Pay ${formatCurrency(totalAmount)}`}
      </button>
      <p className={styles.paymentDisclaimer}>
        🔒 Demo mode: No actual charge will be made
      </p>
    </form>
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
                <Elements stripe={stripePromise}>
                  <CheckoutForm selectedSeats={selectedSeats} event={event} onSuccess={() => navigate('/dashboard')} />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
