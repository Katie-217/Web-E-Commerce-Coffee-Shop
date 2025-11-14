require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Customer = require('../src/models/Customer');
const Product  = require('../src/models/Product');
const Order    = require('../src/models/Order');
const Voucher  = require('../src/models/Voucher'); 

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CoffeeDB';

const readJSON = (file) => {
  const p = path.join(__dirname, '..', 'docs', file);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
};

const ensureHashedCustomers = async (raw = []) => {
  const out = [];
  for (const u of raw) {
    const copy = { ...u };
    // đảm bảo các field cơ bản
    if (!copy.provider) copy.provider = 'local';
    if (copy.avatar === undefined) copy.avatar = '/images/avatars/default.png';

    // hash nếu đang là plaintext
    const pwd = String(copy.password || '');
    const isHashed = pwd.startsWith('$2'); // bcrypt prefix
    copy.password = isHashed ? pwd : await bcrypt.hash(pwd || '123456', 10);

    out.push(copy);
  }
  return out;
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const customersRaw = readJSON('customers.json');
    const products     = readJSON('products.json');
    const orders       = readJSON('orders.json');
    const vouchersData  = readJSON('vouchers.json');

    const customers = await ensureHashedCustomers(customersRaw);

    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Voucher.deleteMany({})
    ]);

    const insertedCustomers = await Customer.insertMany(customers);
    const insertedProducts  = await Product.insertMany(products);

    // map nhanh
    const byEmail = new Map(insertedCustomers.map(u => [u.email, u._id]));
    const byName  = new Map(insertedProducts.map(p => [p.name, p])); 
    if (vouchersData.length) {
      await Voucher.insertMany(vouchersData);        // <-- DÙNG vouchersData, KHÔNG PHẢI vouchers
    }

    // tạo orders
    for (const o of orders) {
      const userId = byEmail.get(o.userEmail);
      if (!userId) continue;

      const items = (o.items || [])
        .map(it => {
          const p = byName.get(it.name);
          return p
            ? { product: p._id, name: p.name, price: p.price, qty: it.qty || 1 }
            : null;
        })
        .filter(Boolean);

      const total = items.reduce((s, i) => s + i.price * i.qty, 0);

      await Order.create({
        user: userId,
        items,
        total,
        status: o.status || 'pending',
        address: o.address || ''
      });
    }

    console.log('✅ Seed done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
