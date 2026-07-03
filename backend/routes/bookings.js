const router = require('express').Router();
const {
  createPaymentIntent, confirmBooking, getUserBookings,
  getBookingById, cancelBooking, getAllBookings, getVendorBookings
} = require('../controllers/bookingController');
const { auth, requireRole } = require('../middleware/auth');

// Inject io into req
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

router.post('/payment-intent', auth, createPaymentIntent);
router.post('/confirm', auth, confirmBooking);
router.get('/my', auth, getUserBookings);
router.get('/all', auth, requireRole('admin'), getAllBookings);
router.get('/vendor', auth, requireRole('vendor', 'admin'), getVendorBookings);
router.get('/:id', auth, getBookingById);
router.post('/:id/cancel', auth, cancelBooking);

module.exports = router;
