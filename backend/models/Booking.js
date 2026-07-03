const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  seats: [
    {
      seatNumber: { type: String, required: true },
      row: { type: String },
      category: { type: String },
      price: { type: Number, required: true },
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentIntentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  refundId: { type: String },
  refundAmount: { type: Number },
  refundedAt: { type: Date },
  cancelledAt: { type: Date },
  bookingRef: { type: String, unique: true },
  qrCode: { type: String },
}, { timestamps: true });

// Generate booking reference before saving
bookingSchema.pre('save', function () {
  if (!this.bookingRef) {
    this.bookingRef = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
