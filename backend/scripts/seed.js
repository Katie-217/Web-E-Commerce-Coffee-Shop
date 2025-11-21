require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Customer = require('../models/Customer');
const Product  = require('../models/Product');
const Order    = require('../models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CoffeeDB';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'docs');
const readJSON = (file) => {
  const p = path.isAbsolute(file) ? file : path.join(DATA_DIR, file);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
};

const ensureHashedCustomers = async (raw = []) => {
  const out = [];
  for (const u of raw) {
    const copy = { ...u };
    if (!copy.provider) copy.provider = 'local';
    copy.avatar = copy.avatar || copy.avatarUrl || '/images/avatars/default.png';
    copy.name = copy.name || copy.fullName;
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
    const products     = readJSON('coffee_products.json');     // <-- đổi đúng tên file
    const orders       = readJSON('orders.json');
    //const vouchersData = readJSON('vouchers.json');

    const customers = await ensureHashedCustomers(customersRaw);

    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      //Voucher.deleteMany({})
    ]);

    const insertedCustomers = await Customer.insertMany(customers);
    const insertedProducts  = await Product.insertMany(products, { ordered: true });

    // Index nhanh để join
    const byEmail   = new Map(insertedCustomers.map(u => [u.email, u._id]));
    const byName    = new Map(insertedProducts.map(p => [p.name, p]));
    const bySku     = new Map(insertedProducts.map(p => [p.sku, p]));
    // Map id gốc (trong coffee_products.json) -> document đã insert (zip theo index)
    const byLegacyId = new Map(products.map((p, idx) => [String(p.id), insertedProducts[idx]]));

    // if (vouchersData.length) {
    //   await Voucher.insertMany(vouchersData);
    // }

    // tạo orders
        // tạo orders
    for (const o of orders) {
      // xác định email từ data JSON
      const email = o.customerEmail || o.userEmail || o.email;
      const userId = byEmail.get(email);

      if (!userId) {
        console.warn('Skip order (unknown customer):', email);
        continue;
      }

      const items = (o.items || []).map(it => {
        // tìm product tương ứng
        const p =
          (it.productId != null && byLegacyId.get(String(it.productId))) ||
          (it.sku && bySku.get(it.sku)) ||
          byName.get(it.name);

        if (!p) {
          console.warn('Skip item (product not found):', it);
          return null;
        }

        const qty   = it.qty ?? it.quantity ?? 1;
        const price = (typeof it.price === 'number') ? it.price : (p.price ?? 0);

        return {
          productId: p._id,   // để pass được Order schema (items.productId required)
          name: p.name,
          sku: p.sku,
          price,
          qty
        };
      }).filter(Boolean);

      if (!items.length) {
        console.warn('Skip order with no valid items:', o.id || email);
        continue;
      }

      const subtotal    = (typeof o.subtotal === 'number')
        ? o.subtotal
        : items.reduce((s, i) => s + i.price * i.qty, 0);
      const shippingFee = Number(o.shippingFee || 0);
      const discount    = Number(o.discount || 0);
      const total       = (typeof o.total === 'number')
        ? o.total
        : subtotal + shippingFee - discount;

      await Order.create({
        id: o.id,                 // required trong schema Order
        customerEmail: email,     // required trong schema Order
        user: userId,
        items,
        subtotal,
        discount,
        shippingFee,
        total,
        currency: o.currency || 'VND',
        status: o.status || 'pending',
        paymentStatus: o.paymentStatus || 'pending',
        paymentMethod: o.paymentMethod || 'cod',
        shippingAddress: o.shippingAddress || o.address || null,
        billingAddress:  o.billingAddress || null,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt
      });
    }


    console.log('✅ Seed done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
