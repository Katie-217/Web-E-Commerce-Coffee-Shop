// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// chuẩn hoá object user trả về FE
function toUserPayload(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    name: doc.name || doc.fullName || '',
    email: doc.email,
    avatar: doc.avatar || doc.avatarUrl || null,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing name, email or password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      name: name.trim(),
      fullName: name.trim(),
      email: normalizedEmail,
      password: hashed,
      status: 'active',
      provider: 'local',
    });

    const token = jwt.sign(
      { sub: customer._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: toUserPayload(customer),
    });
  } catch (err) {
    console.error('[auth/register] error:', err);
    return res.status(500).json({
      message: 'Register failed',
      error: err.message,
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // password là hash từ seed.js hoặc từ register
    const ok = await bcrypt.compare(password, customer.password);
    if (!ok) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { sub: customer._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: toUserPayload(customer),
    });
  } catch (err) {
    console.error('[auth/login] error:', err);
    return res.status(500).json({
      message: 'Login failed',
      error: err.message,
    });
  }
});

// middleware check token
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(toUserPayload(customer));
  } catch (err) {
    console.error('[auth/me] error:', err);
    return res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
});

// POST /api/auth/logout (JWT thì FE chỉ xoá token)
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out' });
});

module.exports = router;
