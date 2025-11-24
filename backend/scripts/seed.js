require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // 👈 THÊM DÒNG NÀY

// Mongoose models
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Thư mục chứa các file JSON
const DATA_DIR = path.join(__dirname, '..', 'docs');

function readJSON(filename) {
  const fullPath = path.isAbsolute(filename)
    ? filename
    : path.join(DATA_DIR, filename);

  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
}

// Đảm bảo password đã hash, nếu chưa thì hash
const ensureHashedCustomers = async (raw = []) => {
  const out = [];
  for (const u of raw) {
    const copy = { ...u };

    if (!copy.provider) copy.provider = 'local';
    copy.avatar = copy.avatar || copy.avatarUrl || '/images/avatars/default.png';
    copy.name = copy.name || copy.fullName;
    copy.fullName = copy.fullName || copy.name;

    const pwd = String(copy.password || '');
    const isHashed = pwd.startsWith('$2'); // bcrypt prefix
    // nếu không có password thì dùng '123456', rồi hash luôn
    copy.password = isHashed ? pwd : await bcrypt.hash(pwd || '123456', 10);

    out.push(copy);
  }
  return out;
};

// Đệ quy convert mọi object dạng { "$oid": "..." } → ObjectId
// và { "$date": "..." } → Date
function mapMongoIds(value) {
  const { ObjectId } = mongoose.Types;

  if (Array.isArray(value)) {
    return value.map(mapMongoIds);
  }

  if (value && typeof value === 'object') {
    // Dạng { "$oid": "..." }
    if (value.$oid) {
      return new ObjectId(value.$oid);
    }

    // Dạng { "$date": "..." }
    if (value.$date) {
      return new Date(value.$date);
    }

    const obj = {};
    for (const [k, v] of Object.entries(value)) {
      obj[k] = mapMongoIds(v);
    }
    return obj;
  }

  return value;
}

async function seed() {
  // Ưu tiên MONGO_URI, fallback về MONGODB_URI + DATABASE_NAME
  const mongoUri =
    process.env.MONGO_URI ||
    (process.env.MONGODB_URI && process.env.DATABASE_NAME
      ? `${process.env.MONGODB_URI.replace(/\/$/, '')}/${process.env.DATABASE_NAME}`
      : 'mongodb://127.0.0.1:27017/CoffeeDB');

  console.log('🔗 Connecting to MongoDB:', mongoUri);

  await mongoose.connect(mongoUri);
  console.log('✅ Mongo connected');

  try {
    // Đọc data từ docs/
    const customersRaw = readJSON('customersList.json');
    const productsRaw = readJSON('productsList.json');
    const ordersRaw = readJSON('ordersList.json');

    let shippingRaw = [];
    try {
      shippingRaw = readJSON('shipping_activity_data.json');
    } catch (err) {
      console.warn(
        '⚠️  Không thấy shipping_activity_data.json, bỏ qua phần shipping activity.'
      );
    }

    // Convert $oid / $date
    const customersMapped = customersRaw.map(mapMongoIds);
    const customers = await ensureHashedCustomers(customersMapped); // 👈 DÙNG ensureHashedCustomers
    const products = productsRaw.map(mapMongoIds);
    const orders = ordersRaw.map(mapMongoIds);
    const shipping = shippingRaw.map(mapMongoIds);

    // Xoá data cũ
    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🧹 Đã xoá Customer, Product, Order cũ');

    if (shipping.length) {
      await mongoose.connection
        .collection('shipping_activity_data')
        .deleteMany({});
      console.log('🧹 Đã xoá collection shipping_activity_data cũ');
    }

    // Insert mới
    const insertedCustomers = await Customer.insertMany(customers);
    console.log(`👤 Inserted ${insertedCustomers.length} customers`);

    const insertedProducts = await Product.insertMany(products);
    console.log(`☕ Inserted ${insertedProducts.length} products`);

    const insertedOrders = await Order.insertMany(orders);
    console.log(`📦 Inserted ${insertedOrders.length} orders`);

    if (shipping.length) {
      const res = await mongoose.connection
        .collection('shipping_activity_data')
        .insertMany(shipping);
      console.log(`🚚 Inserted ${res.insertedCount} shipping activity docs`);
    }

    console.log('✅ SEED HOÀN TẤT OK');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Mongo disconnected');
  }
}

seed();
