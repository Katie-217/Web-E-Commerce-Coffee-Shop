/**
 * Script to import displayCode from ordersList.json to MongoDB
 * Updates all orders in MongoDB with displayCode from JSON file
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ordersFilePath = path.join(__dirname, '../docs/ordersList.json');

async function importDisplayCodes() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CoffeeDB';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read orders from JSON
    console.log('Reading ordersList.json...');
    const orders = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
    console.log(`Found ${orders.length} orders in JSON file`);

    // Create a map of order id -> displayCode
    const displayCodeMap = new Map();
    orders.forEach(order => {
      if (order.id && order.displayCode) {
        displayCodeMap.set(order.id, order.displayCode);
      }
    });

    console.log(`Found ${displayCodeMap.size} orders with displayCode in JSON`);

    // Try different databases/collections
    const collections = [
      { db: 'orders', collection: 'ordersList' },
      { db: null, collection: 'ordersList' }, // Current database
    ];

    for (const { db, collection: collName } of collections) {
      try {
        const targetDb = db ? mongoose.connection.useDb(db, { useCache: true }) : mongoose.connection.db;
        const coll = targetDb.collection(collName);
        
        const totalCount = await coll.countDocuments({});
        console.log(`\n=== Processing ${db || 'current'} database > ${collName} collection ===`);
        console.log(`Total orders: ${totalCount}`);

        if (totalCount === 0) {
          console.log('No orders found, skipping...');
          continue;
        }

        // Update each order with displayCode from JSON
        let updated = 0;
        let notFound = 0;
        let alreadyHasCode = 0;

        for (const [orderId, displayCode] of displayCodeMap.entries()) {
          try {
            // Try to find order by id
            const result = await coll.updateOne(
              { id: orderId },
              { $set: { displayCode } }
            );

            if (result.matchedCount > 0) {
              if (result.modifiedCount > 0) {
                updated++;
              } else {
                alreadyHasCode++;
              }
            } else {
              notFound++;
            }
          } catch (err) {
            console.error(`Error updating order ${orderId}:`, err.message);
          }
        }

        console.log(`\n✅ Completed:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Already has code: ${alreadyHasCode}`);
        console.log(`   - Not found: ${notFound}`);
      } catch (err) {
        console.error(`Error processing ${db || 'current'} database:`, err.message);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

importDisplayCodes();











