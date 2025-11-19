const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'CoffeeDB';

async function debugCollections() {
  try {
    const connectionString = `${MONGODB_URI}/${DATABASE_NAME}`;
    console.log('🔗 Connecting to:', connectionString);
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    const db = mongoose.connection.db;
    console.log(`📊 Database: ${db.databaseName}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 All collections:', collections.map(c => c.name));
    
    // Check each collection
    for (const collInfo of collections) {
      const collName = collInfo.name;
      const coll = db.collection(collName);
      const count = await coll.countDocuments({});
      console.log(`\n📦 Collection: ${collName}`);
      console.log(`   Total documents: ${count}`);
      
      if (count > 0) {
        // Get first document to see structure
        const sample = await coll.findOne({});
        console.log(`   Sample document keys:`, Object.keys(sample || {}));
        if (sample) {
          // Check if it has nested structure
          if (sample.productsList) {
            console.log(`   ⚠️  Has 'productsList' field (nested structure)`);
          }
          if (sample.ordersList) {
            console.log(`   ⚠️  Has 'ordersList' field (nested structure)`);
          }
          if (sample.customersList) {
            console.log(`   ⚠️  Has 'customersList' field (nested structure)`);
          }
        }
      }
    }
    
    // Try to access collections directly (even if not in listCollections)
    const directCollections = ['productsList', 'ordersList', 'customersList', 'products.productsList', 'orders.ordersList', 'customers.customersList'];
    console.log('\n🔍 Checking direct collection access:');
    for (const collName of directCollections) {
      try {
        const coll = db.collection(collName);
        const count = await coll.countDocuments({});
        if (count > 0) {
          console.log(`   ✅ ${collName}: ${count} documents`);
          const sample = await coll.findOne({});
          console.log(`      Sample keys:`, Object.keys(sample || {}));
        } else {
          console.log(`   ⚠️  ${collName}: 0 documents (but collection exists)`);
        }
      } catch (err) {
        console.log(`   ❌ ${collName}: ${err.message}`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugCollections();











