// Script to generate displayCode for existing orders
const mongoose = require('mongoose');
require('dotenv').config();

// Function to generate random 4-character alphanumeric code (0-9, a-z, A-Z)
const generateDisplayCode = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to ensure unique displayCode
const generateUniqueDisplayCode = async (collection) => {
  let code;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 100;
  
  while (exists && attempts < maxAttempts) {
    code = generateDisplayCode();
    const existing = await collection.findOne({ displayCode: code });
    exists = !!existing;
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique displayCode after max attempts');
  }
  
  return code;
};

async function generateDisplayCodes() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CoffeeDB';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

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

        // Find orders without displayCode
        const ordersWithoutCode = await coll.find({ 
          $or: [
            { displayCode: { $exists: false } },
            { displayCode: null },
            { displayCode: '' }
          ]
        }).toArray();

        console.log(`Orders without displayCode: ${ordersWithoutCode.length}`);

        if (ordersWithoutCode.length === 0) {
          console.log('All orders already have displayCode, skipping...');
          continue;
        }

        // Generate displayCode for each order
        let updated = 0;
        let errors = 0;

        for (const order of ordersWithoutCode) {
          try {
            const displayCode = await generateUniqueDisplayCode(coll);
            await coll.updateOne(
              { _id: order._id },
              { $set: { displayCode } }
            );
            updated++;
            if (updated % 10 === 0) {
              console.log(`Updated ${updated}/${ordersWithoutCode.length} orders...`);
            }
          } catch (err) {
            console.error(`Error updating order ${order._id}:`, err.message);
            errors++;
          }
        }

        console.log(`\n✅ Completed: Updated ${updated} orders, ${errors} errors`);
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

generateDisplayCodes();







