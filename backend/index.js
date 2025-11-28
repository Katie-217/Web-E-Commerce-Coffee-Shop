// backend/server.js (hoặc index.js tuỳ bạn đang đặt tên gì)
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3001; // Đổi port để tránh xung đột với frontend

connectDB();

// ================== MIDDLEWARE CHUNG ==================
const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin (mobile apps, curl) và mọi localhost/127.0.0.1 cho dev
    if (!origin || /(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    // Allow explicit origins defined via env (comma-separated)
    const allowed = (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ================== ROUTES ==================
const accountRoutes = require("./routes/account");
const apiRouter = require("./routes/index");

// route cập nhật tài khoản
app.use("/api/account", accountRoutes);

// các route API còn lại (/api/auth, /api/products, ...)
app.use("/api", apiRouter);

// Routes đơn giản
app.get("/", (req, res) => {
  res.send("Hello from Backend!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
