// Test script để kiểm tra kết nối MongoDB và collection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'products';

async function testConnection() {
  try {
    const connectionString = `${MONGODB_URI}/${DATABASE_NAME}`;
    console.log('🔗 Connecting to:', connectionString);
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Test query productsList collection directly
    const db = mongoose.connection.db;
    const collection = db.collection('productsList');
    const count = await collection.countDocuments();
    console.log(`📦 productsList collection has ${count} documents`);
    
    if (count > 0) {
      const sample = await collection.findOne();
      console.log('📄 Sample document:', JSON.stringify(sample, null, 2));
    }
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();

