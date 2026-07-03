const Event = require('../models/Event');

// Helper: generate seats
const generateSeats = (layout) => {
  const seats = [];
  const categories = layout.categories || [{ name: 'Standard', rows: ['A', 'B', 'C', 'D', 'E'], seatsPerRow: 10, price: 500 }];
  categories.forEach(cat => {
    (cat.rows || ['A']).forEach(row => {
      for (let i = 1; i <= (cat.seatsPerRow || 10); i++) {
        seats.push({
          seatNumber: `${row}${i}`,
          row,
          category: cat.name,
          price: cat.price,
          isBooked: false,
          isHeld: false,
        });
      }
    });
  });
  return seats;
};

exports.createEvent = async (req, res) => {
  try {
    const { seatLayout, ...eventData } = req.body;
    const seats = generateSeats(seatLayout || {});
    const event = await Event.create({
      ...eventData,
      vendor: req.user._id,
      seats,
      totalSeats: seats.length,
      availableSeats: seats.length,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { type, city, date, search, page = 1, limit = 12 } = req.query;
    const filter = { status: 'published' };
    if (type) filter.type = type;
    if (city) filter['venue.city'] = new RegExp(city, 'i');
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { 'venue.city': new RegExp(search, 'i') },
    ];

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('vendor', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-seats'); // exclude seats for listing

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('vendor', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVendorEvents = async (req, res) => {
  try {
    const events = await Event.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.holdSeats = async (req, res) => {
  try {
    const { seatNumbers } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const holdUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 min hold
    const seatUpdates = [];

    for (const seatNum of seatNumbers) {
      const seat = event.seats.find(s => s.seatNumber === seatNum);
      if (!seat) return res.status(400).json({ message: `Seat ${seatNum} not found` });
      if (seat.isBooked) return res.status(400).json({ message: `Seat ${seatNum} is already booked` });
      if (seat.isHeld && seat.heldBy?.toString() !== req.user._id.toString()) {
        if (seat.heldUntil > new Date()) {
          return res.status(400).json({ message: `Seat ${seatNum} is temporarily held` });
        }
      }
      seat.isHeld = true;
      seat.heldBy = req.user._id;
      seat.heldUntil = holdUntil;
      seatUpdates.push(seat);
    }
    await event.save();
    res.json({ message: 'Seats held successfully', holdUntil, seats: seatUpdates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
