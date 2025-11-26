require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001; // Đổi port để tránh xung đột với frontend
connectDB();

// Middleware
// Enable CORS for local development (3000, 5173, etc.) with credentials support
const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin (mobile apps, curl) and any localhost/127.0.0.1 origins for dev
    if (!origin || /(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
    // Allow explicit origins defined via env (comma-separated)
    const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes - Sử dụng routes/index.js để tổng hợp tất cả routes
const apiRouter = require('./routes/index');
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
