# 🎟️ TicketVault - Multi-Purpose Booking Platform

A full-stack MERN ticketing and booking platform supporting **movies, trains, concerts, sports, theater** and more, with real-time seat updates, live cancellations/refunds, and role-based dashboards.

---

## ✨ Features

### Core Functionality
- 🎬 **Multi-Purpose Events**: Movies, concerts, trains, sports events, theater shows & more
- 🪑 **Real-Time Seating**: Live seat availability with Socket.IO — see other users' selections instantly
- 💳 **Secure Payments**: Stripe integration for payment processing (demo mode included)
- ♻️ **Instant Refunds**: Cancel bookings with automatic refund processing
- 🔔 **Live Notifications**: Real-time booking confirmations and cancellation updates

### User Roles
1. **👤 Customer**: Browse events, book tickets, manage bookings, cancel & get refunds
2. **🏪 Vendor**: Create & manage events, view bookings, track revenue
3. **🔧 Admin**: Platform oversight, user management, event moderation, analytics dashboard

### Advanced Features
- Real-time seat hold mechanism (10 min hold during checkout)
- Multi-category seating (VIP, Premium, Standard, Economy) with dynamic pricing
- Responsive design optimized for mobile & desktop
- Search & filter events by type, city, date
- Booking history with detailed receipts
- Admin analytics & revenue tracking

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Socket.IO client for real-time updates
- Stripe React SDK for payments
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons
- date-fns for date formatting

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT authentication
- bcryptjs for password hashing
- Stripe for payment processing

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud instance)
- Stripe account (for payment testing)

### 1. Clone & Install

```bash
# Navigate to project
cd website

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend (.env):**

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketbooking
JWT_SECRET=your_super_secret_jwt_key_change_in_production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
CLIENT_URL=http://localhost:3000
```

**Frontend:**

Update Stripe publishable key in `frontend/src/pages/EventDetailPage.jsx`:
```javascript
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
```

### 3. Seed Database

Populate with demo users & sample events:

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: admin@ticketvault.com / password123
- **Vendor**: vendor@ticketvault.com / password123
- **Customer**: user@ticketvault.com / password123
- 6 sample events (movies, concerts, trains, sports, theater)

### 4. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000

---

## 📱 Usage Guide

### Customer Flow
1. **Browse Events**: Visit homepage or `/events` to explore
2. **Select Event**: Click on any event card
3. **Choose Seats**: Pick from interactive seat map with live updates
4. **Checkout**: Seats held for 10 minutes while you pay
5. **Payment**: Complete via Stripe (demo mode works without real card)
6. **Booking Confirmed**: Receive confirmation with booking reference
7. **Manage**: View bookings in dashboard, cancel anytime for instant refund

### Vendor Flow
1. **Login**: Use vendor credentials
2. **Dashboard**: View stats (total events, bookings, revenue)
3. **Create Event**: Click "Create Event" button
   - Fill event details
   - Configure seat categories & pricing
   - Publish
4. **Track**: Monitor bookings & revenue in real-time

### Admin Flow
1. **Login**: Use admin credentials
2. **Dashboard**: Platform-wide overview
   - Total users, events, bookings, revenue
3. **Manage Users**: Activate/deactivate accounts, change roles
4. **Monitor Events**: View all events across vendors
5. **Track Bookings**: Complete booking history with payment status

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Events
- `GET /api/events` - List events (with filters)
- `GET /api/events/:id` - Event details
- `POST /api/events` - Create event (vendor/admin)
- `PUT /api/events/:id` - Update event (vendor/admin)
- `DELETE /api/events/:id` - Delete event (vendor/admin)
- `GET /api/events/vendor` - Vendor's events
- `POST /api/events/:id/hold-seats` - Hold seats temporarily

### Bookings
- `POST /api/bookings/payment-intent` - Create Stripe payment intent
- `POST /api/bookings/confirm` - Confirm booking after payment
- `GET /api/bookings/my` - User's bookings
- `GET /api/bookings/:id` - Booking details
- `POST /api/bookings/:id/cancel` - Cancel & refund
- `GET /api/bookings/vendor` - Vendor's bookings (vendor/admin)
- `GET /api/bookings/all` - All bookings (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/toggle` - Activate/deactivate user
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/events` - All events (admin view)

---

## 🔄 Real-Time Features

### Socket.IO Events

**Client → Server:**
- `joinEvent(eventId)` - Join event room for seat updates
- `leaveEvent(eventId)` - Leave event room
- `joinUser(userId)` - Join user room for notifications

**Server → Client:**
- `seatsUpdated` - Broadcast when seats booked/cancelled
  ```javascript
  { eventId, seats, availableSeats }
  ```
- `bookingCancelled` - Notify user of cancellation
  ```javascript
  { bookingId, bookingRef, refundAmount }
  ```

---

## 🎨 Design Highlights

- **Dark theme** with purple/blue accent colors
- **Glassmorphism** cards with subtle shadows
- **Responsive grid** layouts adapting to all screen sizes
- **Interactive seat map** with color-coded categories
- **Toast notifications** for all user actions
- **Loading states** & skeleton screens
- **Badge system** for event types & booking statuses

---

## 🧪 Testing Payment Flow (Demo Mode)

The platform works in **demo mode** without real Stripe integration:

1. Select seats and proceed to checkout
2. Payment form appears with Stripe CardElement
3. Click "Pay" — booking confirms without actual charge
4. In production, replace with real Stripe keys

For real testing:
1. Get Stripe test keys from https://dashboard.stripe.com/test/apikeys
2. Use test card: `4242 4242 4242 4242` (any future date, any CVC)

---

## 📂 Project Structure

```
website/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB schemas (User, Event, Booking)
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── utils/            # Helpers & seed script
│   └── server.js         # Express + Socket.IO server
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/   # Reusable UI (Navbar, EventCard, etc.)
    │   │   └── seating/  # SeatMap component
    │   ├── pages/        # Route pages
    │   │   ├── admin/    # Admin dashboard
    │   │   ├── vendor/   # Vendor dashboard
    │   │   └── customer/ # Customer dashboard
    │   ├── context/      # React Context (Auth)
    │   ├── services/     # API & Socket clients
    │   ├── utils/        # Helper functions
    │   ├── App.jsx       # Root component
    │   └── main.jsx      # Entry point
    └── vite.config.js
```

---

## 🔐 Security Features

- JWT-based authentication with HTTP-only patterns
- Password hashing with bcryptjs (12 rounds)
- Role-based access control (RBAC)
- Input validation on all endpoints
- CORS protection
- Protected routes on frontend
- Secure Stripe payment handling

---

## 🚧 Future Enhancements

- [ ] Email notifications (confirmation, reminders)
- [ ] QR code generation for tickets
- [ ] PDF ticket download
- [ ] Multi-language support
- [ ] Advanced analytics & charts
- [ ] Event recommendations
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Payment gateway alternatives (Razorpay, PayPal)
- [ ] Seat hold queue system
- [ ] Dynamic pricing based on demand
- [ ] Promo codes & discounts

---

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod` or check cloud connection string
- Verify `MONGODB_URI` in `.env`

**Stripe Payment Issues:**
- Check Stripe keys are in test mode
- For demo mode, payment confirmation works without real Stripe

**Socket.IO Not Connecting:**
- Ensure backend is running on port 5000
- Check frontend proxy config in `vite.config.js`

**CORS Errors:**
- Verify `CLIENT_URL` in backend `.env` matches frontend URL
- Check CORS middleware in `server.js`

---

## 📄 License

MIT License - Free to use for personal & commercial projects

---

## 👨‍💻 Developer

Built with ❤️ using MERN Stack

**Key Technologies:**
- Real-time updates via Socket.IO
- Secure payments with Stripe
- RESTful API design
- Responsive React components
- MongoDB aggregation for analytics

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev)
- Images from [Unsplash](https://unsplash.com)
- UI inspiration from modern booking platforms

---

**Ready to book your next experience? Start the app and explore! 🎉**
