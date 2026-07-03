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
    <form onSubmit={handlePay} style={styles.checkoutForm}>
      <h3 style={{ marginBottom: '1rem' }}>Payment</h3>
      <div style={styles.summary}>
        <p>Selected Seats: {selectedSeats.join(', ')}</p>
        <p style={{ fontWeight: '700', fontSize: '1.2rem', color: '#6c63ff', marginTop: '0.5rem' }}>
          Total: {formatCurrency(totalAmount)}
        </p>
      </div>
      <div style={{ padding: '0.75rem', background: '#0f0f1a', borderRadius: '8px', border: '1px solid #2a2a4a' }}>
        <CardElement options={{ style: { base: { color: '#e2e8f0', fontSize: '14px' } } }} />
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={processing || !stripe}>
        {processing ? <><span className="spinner" /> Processing...</> : `Pay ${formatCurrency(totalAmount)}`}
      </button>
      <p style={{ fontSize: '0.75rem', color: '#8892a4', textAlign: 'center', marginTop: '0.5rem' }}>
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

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!event) return null;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <span className={`badge ${getEventTypeBadge(event.type)}`} style={{ marginBottom: '0.5rem', width: 'fit-content' }}>
              {event.type}
            </span>
            <h1 style={styles.title}>{event.title}</h1>
            <p style={styles.desc}>{event.description}</p>
            <div style={styles.metaRow}>
              <span><Calendar size={16} /> {formatDate(event.date)} at {formatTime(event.date)}</span>
              <span><MapPin size={16} /> {event.venue?.name}, {event.venue?.city}</span>
              {event.duration && <span><Clock size={16} /> {event.duration} mins</span>}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '2rem', marginTop: '2rem', alignItems: 'start' }}>
          <div className="card">
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={20} /> Select Seats
            </h2>
            <SeatMap
              event={event}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              currentUserId={user?._id}
            />
          </div>

          <div style={{ position: 'sticky', top: '80px' }}>
            {!checkingOut ? (
              <div className="card">
                <h3>Booking Summary</h3>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #2a2a4a' }}>
                  <p style={{ color: '#8892a4', marginBottom: '0.5rem' }}>
                    {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                  </p>
                  {selectedSeats.map(sn => {
                    const seat = event.seats.find(s => s.seatNumber === sn);
                    return seat ? (
                      <div key={sn} style={styles.seatLine}>
                        <span>{seat.seatNumber} ({seat.category})</span>
                        <span>{formatCurrency(seat.price)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div style={{ ...styles.seatLine, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #2a2a4a', fontSize: '1.1rem', fontWeight: '700' }}>
                  <span>Total</span>
                  <span style={{ color: '#6c63ff' }}>
                    {formatCurrency(selectedSeats.reduce((sum, sn) => {
                      const seat = event.seats.find(s => s.seatNumber === sn);
                      return sum + (seat?.price || 0);
                    }, 0))}
                  </span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
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

const styles = {
  hero: { background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: '12px', padding: '2rem' },
  heroContent: {},
  title: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.75rem' },
  desc: { color: '#8892a4', lineHeight: 1.6, marginBottom: '1rem' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#94a3b8' },
  seatLine: { display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' },
  checkoutForm: {},
  summary: { marginBottom: '1rem', padding: '1rem', background: '#16213e', borderRadius: '8px' },
};
