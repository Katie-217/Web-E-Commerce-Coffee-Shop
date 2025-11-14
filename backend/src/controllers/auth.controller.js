// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const sign = (user) =>
  jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

async function register(req, res) {
  const { name, email, password } = req.body;
  const exists = await Customer.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const user = new Customer({ name, email, password }); // pre-save sẽ hash
  await user.save();

  const token = sign(user);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await Customer.findOne({ email }).select('+password');
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid email or password' });

  const token = sign(user);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
}

async function me(req, res) {
  // req.user được gắn bởi middleware auth
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const user = await Customer.findById(req.user._id);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar });
}

async function logout(_req, res) {
  // Nếu dùng JWT stateless thì chỉ cần cho FE xoá token
  res.json({ ok: true });
}

module.exports = { register, login, me, logout };
