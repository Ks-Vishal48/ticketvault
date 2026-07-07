const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_dummy') return null;
  return require('stripe')(key);
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    // Block admin creation via public register — only customer and vendor allowed
    const allowedRole = ['customer', 'vendor'].includes(role) ? role : 'customer';
    const user = await User.create({ name, email, password, role: allowedRole, phone });

    // Create Stripe customer (skip if no valid key)
    try {
      const stripe = getStripe();
      if (stripe) {
        const customer = await stripe.customers.create({ email: user.email, name: user.name });
        user.stripeCustomerId = customer.id;
        await user.save();
      }
    } catch (e) {
      console.log('Stripe customer creation skipped:', e.message);
    }

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
