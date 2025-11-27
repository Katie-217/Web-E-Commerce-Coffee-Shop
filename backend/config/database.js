// backend/config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

// Dùng chung với seed.js:
// seed.js: MONGO_URI || 'mongodb://127.0.0.1:27017/CoffeeDB'
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/CoffeeDB';

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








