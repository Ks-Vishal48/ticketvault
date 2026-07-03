const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: String },
  category: { type: String, enum: ['VIP', 'Premium', 'Standard', 'Economy'], default: 'Standard' },
  price: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
  isHeld: { type: Boolean, default: false }, // temporarily held during checkout
  heldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  heldUntil: { type: Date },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['movie', 'train', 'concert', 'sports', 'theater', 'other'], required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: {
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  image: { type: String, default: '' },
  seats: [seatSchema],
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'published' },
  tags: [String],
  // For movies
  duration: { type: Number }, // in minutes
  language: { type: String },
  rating: { type: String },
  // For trains
  trainNumber: { type: String },
  fromStation: { type: String },
  toStation: { type: String },
  // For concerts
  artist: { type: String },
  genre: { type: String },
}, { timestamps: true });

eventSchema.pre('save', function () {
  if (this.isModified('seats')) {
    this.availableSeats = this.seats.filter(s => !s.isBooked).length;
  }
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.totalSeats;
  }
});

module.exports = mongoose.model('Event', eventSchema);
