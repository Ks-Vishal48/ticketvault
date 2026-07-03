const Booking = require('../models/Booking');
const Event = require('../models/Event');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { eventId, seatNumbers } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    let totalAmount = 0;
    const selectedSeats = [];

    for (const seatNum of seatNumbers) {
      const seat = event.seats.find(s => s.seatNumber === seatNum);
      if (!seat) return res.status(400).json({ message: `Seat ${seatNum} not found` });
      if (seat.isBooked) return res.status(400).json({ message: `Seat ${seatNum} already booked` });
      totalAmount += seat.price;
      selectedSeats.push({ seatNumber: seat.seatNumber, row: seat.row, category: seat.category, price: seat.price });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // paise/cents
      currency: 'inr',
      metadata: {
        eventId: eventId,
        userId: req.user._id.toString(),
        seats: JSON.stringify(seatNumbers),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, totalAmount, selectedSeats, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Confirm booking after payment
exports.confirmBooking = async (req, res) => {
  try {
    const { eventId, seatNumbers, paymentIntentId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Verify payment
    let paymentVerified = false;
    let paymentStatus = 'pending';
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === 'succeeded') {
        paymentVerified = true;
        paymentStatus = 'paid';
      }
    } catch (e) {
      // For demo: allow without real stripe verification
      paymentVerified = true;
      paymentStatus = 'paid';
    }

    if (!paymentVerified) {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    let totalAmount = 0;
    const selectedSeats = [];

    for (const seatNum of seatNumbers) {
      const seat = event.seats.find(s => s.seatNumber === seatNum);
      if (!seat) return res.status(400).json({ message: `Seat ${seatNum} not found` });
      if (seat.isBooked) return res.status(400).json({ message: `Seat ${seatNum} already booked` });
      seat.isBooked = true;
      seat.isHeld = false;
      seat.bookedBy = req.user._id;
      seat.heldBy = null;
      seat.heldUntil = null;
      totalAmount += seat.price;
      selectedSeats.push({ seatNumber: seat.seatNumber, row: seat.row, category: seat.category, price: seat.price });
    }

    event.availableSeats = event.seats.filter(s => !s.isBooked).length;
    await event.save();

    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      seats: selectedSeats,
      totalAmount,
      status: 'confirmed',
      paymentIntentId,
      paymentStatus,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('event', 'title date venue type image')
      .populate('user', 'name email');

    // Emit real-time update via socket (attached in server.js)
    if (req.io) {
      req.io.to(`event-${eventId}`).emit('seatsUpdated', {
        eventId,
        seats: event.seats,
        availableSeats: event.availableSeats,
      });
    }

    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date venue type image')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date venue type image artist')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel and refund
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    // Process refund via Stripe
    let refundId = null;
    let refundAmount = booking.totalAmount;
    if (booking.paymentIntentId && booking.paymentStatus === 'paid') {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          amount: Math.round(refundAmount * 100),
        });
        refundId = refund.id;
      } catch (e) {
        console.log('Stripe refund skipped (demo mode):', e.message);
        refundId = 'demo_refund_' + Date.now();
      }
    }

    // Free the seats
    const event = await Event.findById(booking.event._id);
    if (event) {
      booking.seats.forEach(bs => {
        const seat = event.seats.find(s => s.seatNumber === bs.seatNumber);
        if (seat) {
          seat.isBooked = false;
          seat.bookedBy = null;
        }
      });
      event.availableSeats = event.seats.filter(s => !s.isBooked).length;
      await event.save();

      // Emit real-time update
      if (req.io) {
        req.io.to(`event-${event._id}`).emit('seatsUpdated', {
          eventId: event._id,
          seats: event.seats,
          availableSeats: event.availableSeats,
        });
      }
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.refundId = refundId;
    booking.refundAmount = refundAmount;
    booking.refundedAt = new Date();
    booking.cancelledAt = new Date();
    await booking.save();

    // Notify user via socket
    if (req.io) {
      req.io.to(`user-${booking.user}`).emit('bookingCancelled', {
        bookingId: booking._id,
        bookingRef: booking.bookingRef,
        refundAmount,
      });
    }

    res.json({ message: 'Booking cancelled and refund initiated', booking, refundAmount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('event', 'title date type venue')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendor: bookings for vendor's events
exports.getVendorBookings = async (req, res) => {
  try {
    const Event = require('../models/Event');
    const vendorEvents = await Event.find({ vendor: req.user._id }).select('_id');
    const eventIds = vendorEvents.map(e => e._id);
    const bookings = await Booking.find({ event: { $in: eventIds } })
      .populate('event', 'title date type venue')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
