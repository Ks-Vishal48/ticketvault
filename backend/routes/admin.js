const router = require('express').Router();
const {
  getDashboardStats, getAllUsers, toggleUserStatus,
  updateUserRole, getAllEventsAdmin
} = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/events', getAllEventsAdmin);

module.exports = router;
