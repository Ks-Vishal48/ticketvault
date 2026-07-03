require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');

const generateSeats = (categories) => {
  const seats = [];
  categories.forEach(cat => {
    cat.rows.forEach(row => {
      for (let i = 1; i <= cat.seatsPerRow; i++) {
        seats.push({ seatNumber: `${row}${i}`, row, category: cat.name, price: cat.price, isBooked: false });
      }
    });
  });
  return seats;
};

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Event.deleteMany({});
  console.log('Cleared existing data');

  // Let the User model's pre-save hook handle hashing
  const admin = await User.create({ name: 'Admin User', email: 'admin@ticketvault.com', password: 'password123', role: 'admin', isActive: true });
  const vendor = await User.create({ name: 'Event Vendor', email: 'vendor@ticketvault.com', password: 'password123', role: 'vendor', isActive: true });
  const customer = await User.create({ name: 'Test Customer', email: 'user@ticketvault.com', password: 'password123', role: 'customer', isActive: true });

  console.log('Users created');

  // Create sample events
  const events = [
    {
      title: 'Avengers: Secret Wars',
      description: 'The epic conclusion to the Marvel Cinematic Universe. Earth\'s mightiest heroes face their greatest challenge yet.',
      type: 'movie',
      vendor: vendor._id,
      venue: { name: 'PVR IMAX', address: 'Phoenix Mall', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 180,
      language: 'English',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 6, price: 1500 },
        { name: 'Premium', rows: ['C', 'D', 'E'], seatsPerRow: 8, price: 900 },
        { name: 'Standard', rows: ['F', 'G', 'H', 'I', 'J'], seatsPerRow: 10, price: 450 },
      ],
    },
    {
      title: 'Coldplay: Music of the Spheres World Tour',
      description: 'The multi-platinum band brings their spectacular world tour to India with an unforgettable light show.',
      type: 'concert',
      vendor: vendor._id,
      venue: { name: 'D.Y. Patil Stadium', address: 'Navi Mumbai', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      artist: 'Coldplay',
      genre: 'Pop Rock',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B', 'C'], seatsPerRow: 10, price: 8000 },
        { name: 'Premium', rows: ['D', 'E', 'F', 'G'], seatsPerRow: 15, price: 4500 },
        { name: 'Standard', rows: ['H', 'I', 'J', 'K', 'L'], seatsPerRow: 20, price: 2000 },
        { name: 'Economy', rows: ['M', 'N', 'O'], seatsPerRow: 25, price: 999 },
      ],
    },
    {
      title: 'Mumbai to Delhi Rajdhani Express',
      description: 'Premium AC express train connecting Mumbai Central to Hazrat Nizamuddin. Includes meals.',
      type: 'train',
      vendor: vendor._id,
      venue: { name: 'Mumbai Central Station', address: 'Mumbai Central', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      trainNumber: '12951',
      fromStation: 'Mumbai Central',
      toStation: 'H. Nizamuddin',
      image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A'], seatsPerRow: 8, price: 3500 },
        { name: 'Premium', rows: ['B', 'C'], seatsPerRow: 12, price: 2200 },
        { name: 'Standard', rows: ['D', 'E', 'F', 'G'], seatsPerRow: 16, price: 1100 },
        { name: 'Economy', rows: ['H', 'I', 'J'], seatsPerRow: 18, price: 650 },
      ],
    },
    {
      title: 'IPL 2026: Mumbai Indians vs CSK',
      description: 'The biggest rivalry in Indian cricket! Don\'t miss this high-octane T20 clash at Wankhede.',
      type: 'sports',
      vendor: vendor._id,
      venue: { name: 'Wankhede Stadium', address: 'Marine Lines', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 15, price: 5000 },
        { name: 'Premium', rows: ['C', 'D', 'E'], seatsPerRow: 20, price: 2500 },
        { name: 'Standard', rows: ['F', 'G', 'H', 'I', 'J'], seatsPerRow: 25, price: 1200 },
        { name: 'Economy', rows: ['K', 'L', 'M'], seatsPerRow: 30, price: 500 },
      ],
    },
    {
      title: 'Hamlet - Shakespeare\'s Masterpiece',
      description: 'A critically acclaimed modern adaptation of Shakespeare\'s Hamlet by the National Theatre Company.',
      type: 'theater',
      vendor: vendor._id,
      venue: { name: 'NCPA', address: 'Nariman Point', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 150,
      image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 8, price: 3000 },
        { name: 'Premium', rows: ['C', 'D', 'E'], seatsPerRow: 10, price: 1800 },
        { name: 'Standard', rows: ['F', 'G', 'H', 'I'], seatsPerRow: 12, price: 900 },
      ],
    },
    {
      title: 'Bangalore Techfest 2026',
      description: 'Annual technology festival featuring talks, workshops, and demo sessions from global tech leaders.',
      type: 'other',
      vendor: vendor._id,
      venue: { name: 'Bangalore International Exhibition Centre', address: 'Tumkur Road', city: 'Bangalore', country: 'India' },
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B', 'C'], seatsPerRow: 10, price: 4000 },
        { name: 'Standard', rows: ['D', 'E', 'F', 'G', 'H', 'I', 'J'], seatsPerRow: 20, price: 1500 },
        { name: 'Economy', rows: ['K', 'L', 'M', 'N'], seatsPerRow: 25, price: 500 },
      ],
    },
  ];

  for (const evData of events) {
    const { seatCategories, ...rest } = evData;
    const seats = generateSeats(seatCategories);
    await Event.create({
      ...rest,
      seats,
      totalSeats: seats.length,
      availableSeats: seats.length,
      status: 'published',
    });
  }

  console.log('Events created');
  console.log('\n✅ Seed complete!');
  console.log('\nDemo accounts:');
  console.log('  Admin:    admin@ticketvault.com / password123');
  console.log('  Vendor:   vendor@ticketvault.com / password123');
  console.log('  Customer: user@ticketvault.com / password123\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
