/**
 * Script to sync orders from ordersList.json to MongoDB
 * Updates pointsEarned, pointsUsed, paymentStatus, displayCode in MongoDB
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ordersFilePath = path.join(__dirname, '../docs/ordersList.json');

async function syncOrdersToMongoDB() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CoffeeDB';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read orders from JSON
    console.log('Reading ordersList.json...');
    const orders = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
    console.log(`Found ${orders.length} orders in JSON file`);

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
        console.log(`Total orders in MongoDB: ${totalCount}`);

        if (totalCount === 0) {
          console.log('No orders found, skipping...');
          continue;
        }

        // Update each order with data from JSON
        let updated = 0;
        let notFound = 0;
        let errors = 0;

        for (const order of orders) {
          try {
            if (!order.id) continue;

            // Prepare update data
            const updateData = {};
            if (order.displayCode) updateData.displayCode = order.displayCode;
            if (order.pointsEarned !== undefined) updateData.pointsEarned = order.pointsEarned;
            if (order.pointsUsed !== undefined) updateData.pointsUsed = order.pointsUsed;
            if (order.paymentStatus) updateData.paymentStatus = order.paymentStatus;
            if (order.status) updateData.status = order.status;

            if (Object.keys(updateData).length === 0) continue;

            // Try to find order by id
            const result = await coll.updateOne(
              { id: order.id },
              { $set: updateData }
            );

            if (result.matchedCount > 0) {
              if (result.modifiedCount > 0) {
                updated++;
              }
            } else {
              notFound++;
            }
          } catch (err) {
            console.error(`Error updating order ${order.id}:`, err.message);
            errors++;
          }
        }

        console.log(`\n✅ Completed:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Not found: ${notFound}`);
        console.log(`   - Errors: ${errors}`);
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

syncOrdersToMongoDB();











