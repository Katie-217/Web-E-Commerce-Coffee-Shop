// backend/config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

// Dùng chung với seed.js:
// seed.js: MONGO_URI || 'mongodb://127.0.0.1:27017/CoffeeDB'
// Nếu MONGODB_URI không có database name, thêm DATABASE_NAME
let MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  MONGO_URI = 'mongodb://127.0.0.1:27017/CoffeeDB';
} else {
  // Nếu MONGODB_URI không có database name, thêm DATABASE_NAME
  const DATABASE_NAME = process.env.DATABASE_NAME || 'CoffeeDB';
  
  // Parse URI để kiểm tra xem có database name chưa
  // Pattern: mongodb://host:port/database hoặc mongodb://host:port
  const uriMatch = MONGO_URI.match(/^mongodb:\/\/([^\/]+)(?:\/([^?]+))?/);
  
  if (uriMatch) {
    const hostPort = uriMatch[1]; // host:port
    const existingDb = uriMatch[2]; // database name (nếu có)
    
    if (!existingDb || existingDb.trim() === '') {
      // Không có database name, thêm vào
      MONGO_URI = `mongodb://${hostPort}/${DATABASE_NAME}`;
    }
    // Nếu đã có database name, giữ nguyên
  } else {
    // Fallback: thêm database name vào cuối
    MONGO_URI = MONGO_URI.replace(/\/$/, '') + '/' + DATABASE_NAME;
  }
}

async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // 2 option này đã deprecated nhưng không sao nếu còn, có thể bỏ
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection String: ${MONGO_URI}`);

    const db = mongoose.connection;
    db.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    db.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
    db.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// export đúng là 1 function
module.exports = connectDB;








