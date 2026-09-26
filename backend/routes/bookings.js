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

// Inject io into req + apply auth to all routes
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

router.use(auth);  // all booking routes require login

router.post('/payment-intent', createPaymentIntent);
router.post('/confirm', confirmBooking);
router.get('/my', getUserBookings);
router.get('/all', requireRole('admin'), getAllBookings);
router.get('/vendor', requireRole('vendor', 'admin'), getVendorBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
