// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const { register, login, me, logout } = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

// KHỚP VỚI FE: /api/auth/*
router.post('/register', register);    // POST /api/auth/register
router.post('/login', login);          // POST /api/auth/login
router.get('/me', auth, me);           // GET  /api/auth/me  (cần Bearer token)
router.post('/logout', auth, logout);  // POST /api/auth/logout

module.exports = router;
