const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection String
// Mặc định: mongodb://localhost:27017
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
// Default database name: CoffeeDB (based on MongoDB Compass structure)
const DATABASE_NAME = process.env.DATABASE_NAME || 'CoffeeDB';

// Build connection string with DB name when missing (e.g., mongodb://host:port)
let connectionString = MONGODB_URI;
const hasDbInUri = /mongodb(\+srv)?:\/\/[^/]+\/[A-Za-z0-9_.-]+/.test(MONGODB_URI);
if (DATABASE_NAME && !hasDbInUri) {
  connectionString = `${MONGODB_URI.replace(/\/$/, '')}/${DATABASE_NAME}`;
}

// MongoDB Connection Options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Các options khác nếu cần
  // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  // socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, options);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;

