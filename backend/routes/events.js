const router = require('express').Router();
const {
  createEvent, getAllEvents, getEventById, updateEvent,
  deleteEvent, getVendorEvents, holdSeats
} = require('../controllers/eventController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/vendor', auth, requireRole('vendor', 'admin'), getVendorEvents);
router.get('/:id', getEventById);
router.post('/', auth, requireRole('vendor', 'admin'), createEvent);
router.put('/:id', auth, requireRole('vendor', 'admin'), updateEvent);
router.delete('/:id', auth, requireRole('vendor', 'admin'), deleteEvent);
router.post('/:id/hold-seats', auth, holdSeats);

module.exports = router;
