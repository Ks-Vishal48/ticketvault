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
    {
      title: 'Arijit Singh Live in Concert',
      description: 'The king of melody Arijit Singh performs his greatest hits live. An unforgettable night of Bollywood music.',
      type: 'concert',
      vendor: vendor._id,
      venue: { name: 'MMRDA Grounds', address: 'BKC', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      artist: 'Arijit Singh',
      genre: 'Bollywood',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B', 'C'], seatsPerRow: 10, price: 6000 },
        { name: 'Premium', rows: ['D', 'E', 'F', 'G'], seatsPerRow: 15, price: 3500 },
        { name: 'Standard', rows: ['H', 'I', 'J', 'K', 'L'], seatsPerRow: 20, price: 1800 },
        { name: 'Economy', rows: ['M', 'N', 'O'], seatsPerRow: 25, price: 800 },
      ],
    },
    {
      title: 'Chennai Express - Special Screening',
      description: 'Special 4K remastered screening of the blockbuster Chennai Express with live orchestra performance.',
      type: 'movie',
      vendor: vendor._id,
      venue: { name: 'Sathyam Cinemas', address: 'Royapettah', city: 'Chennai', country: 'India' },
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      duration: 141,
      language: 'Hindi',
      rating: 'U/A',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 8, price: 800 },
        { name: 'Premium', rows: ['C', 'D', 'E'], seatsPerRow: 10, price: 500 },
        { name: 'Standard', rows: ['F', 'G', 'H', 'I', 'J'], seatsPerRow: 12, price: 300 },
      ],
    },
    {
      title: 'Delhi to Agra Shatabdi Express',
      description: 'Premium Shatabdi Express from New Delhi to Agra Cantt. Ideal for Taj Mahal day trips.',
      type: 'train',
      vendor: vendor._id,
      venue: { name: 'New Delhi Railway Station', address: 'Paharganj', city: 'Delhi', country: 'India' },
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      trainNumber: '12001',
      fromStation: 'New Delhi',
      toStation: 'Agra Cantt',
      image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A'], seatsPerRow: 8, price: 1200 },
        { name: 'Premium', rows: ['B', 'C'], seatsPerRow: 12, price: 800 },
        { name: 'Standard', rows: ['D', 'E', 'F'], seatsPerRow: 16, price: 450 },
        { name: 'Economy', rows: ['G', 'H'], seatsPerRow: 18, price: 250 },
      ],
    },
    {
      title: 'Pro Kabaddi League Finals',
      description: 'The ultimate showdown of the Pro Kabaddi League season. Two best teams battle for the championship.',
      type: 'sports',
      vendor: vendor._id,
      venue: { name: 'Nehru Indoor Stadium', address: 'Periamet', city: 'Chennai', country: 'India' },
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1540747913346-19212a4b423b?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 12, price: 2500 },
        { name: 'Premium', rows: ['C', 'D', 'E'], seatsPerRow: 18, price: 1200 },
        { name: 'Standard', rows: ['F', 'G', 'H', 'I'], seatsPerRow: 22, price: 600 },
        { name: 'Economy', rows: ['J', 'K', 'L'], seatsPerRow: 25, price: 250 },
      ],
    },
    {
      title: 'Diljit Dosanjh - Dil-Luminati Tour',
      description: 'Punjabi superstar Diljit Dosanjh brings his massive Dil-Luminati world tour to India.',
      type: 'concert',
      vendor: vendor._id,
      venue: { name: 'JLN Stadium', address: 'Pragati Vihar', city: 'Delhi', country: 'India' },
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      artist: 'Diljit Dosanjh',
      genre: 'Punjabi Pop',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B', 'C'], seatsPerRow: 10, price: 7000 },
        { name: 'Premium', rows: ['D', 'E', 'F', 'G'], seatsPerRow: 15, price: 4000 },
        { name: 'Standard', rows: ['H', 'I', 'J', 'K'], seatsPerRow: 20, price: 2000 },
        { name: 'Economy', rows: ['L', 'M', 'N'], seatsPerRow: 25, price: 900 },
      ],
    },
    {
      title: 'RRR - Re-Release IMAX Special',
      description: 'SS Rajamouli\'s magnum opus RRR returns to IMAX screens with enhanced visuals and Dolby Atmos sound.',
      type: 'movie',
      vendor: vendor._id,
      venue: { name: 'PVR INOX IMAX', address: 'Forum Mall', city: 'Bangalore', country: 'India' },
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      duration: 187,
      language: 'Telugu',
      rating: 'U/A',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 8, price: 1200 },
        { name: 'Premium', rows: ['C', 'D', 'E'], seatsPerRow: 10, price: 750 },
        { name: 'Standard', rows: ['F', 'G', 'H', 'I', 'J'], seatsPerRow: 12, price: 400 },
      ],
    },
    {
      title: 'Mumbai to Goa Tejas Express',
      description: 'India\'s fastest train connecting Mumbai to Goa. Enjoy scenic Konkan coast views with premium amenities.',
      type: 'train',
      vendor: vendor._id,
      venue: { name: 'CSMT Station', address: 'Fort', city: 'Mumbai', country: 'India' },
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      trainNumber: '22119',
      fromStation: 'Mumbai CSMT',
      toStation: 'Madgaon',
      image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600',
      seatCategories: [
        { name: 'VIP', rows: ['A'], seatsPerRow: 6, price: 2800 },
        { name: 'Premium', rows: ['B', 'C'], seatsPerRow: 10, price: 1800 },
        { name: 'Standard', rows: ['D', 'E', 'F'], seatsPerRow: 14, price: 900 },
        { name: 'Economy', rows: ['G', 'H', 'I'], seatsPerRow: 18, price: 500 },
      ],
    },
  ];

  for (const evData of events) {
    const { seatCategories, ...rest } = evData;
    const seats = generateSeats(seatCategories);
    const minPrice = seats.length ? Math.min(...seats.map(s => s.price)) : 0;
    await Event.create({
      ...rest,
      seats,
      totalSeats: seats.length,
      availableSeats: seats.length,
      minPrice,
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
