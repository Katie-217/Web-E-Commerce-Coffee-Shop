const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose;
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const router = express.Router();

// Diagnostics: quick connectivity check
router.get('/ping', async (req, res) => {
  try {
    const total = await Customer.countDocuments({});
    const sample = await Customer.findOne({});
    return res.json({ ok: true, total, sample });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/customers
// Query: q (text search), page, limit
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/customers - Request received');
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const { q } = req.query;
    const filters = {};

    if (q && typeof q === 'string') {
      filters.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    let [items, total] = await Promise.all([
      Customer.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(filters)
    ]);

    console.log(`[customers] list page=${page} limit=${limit} q=${q || ''} -> total=${total} items=${items.length}`);
    if (total === 0) {
      // Fallback 0: plain 'customersList' in current DB
      try {
        const coll0 = mongoose.connection.db.collection('customersList');
        const fbItems0 = await coll0.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
        const fbTotal0 = await coll0.countDocuments(filters);
        console.log(`[customers] fallback 'customersList' -> total=${fbTotal0} items=${fbItems0.length}`);
        if (fbTotal0 > 0) { items = fbItems0; total = fbTotal0; }
      } catch (e) { console.log('[customers] fallback0 error:', e.message); }

      // Fallback 1: dotted collection name 'customers.customersList'
      if (total === 0) {
        try {
          const coll1 = mongoose.connection.db.collection('customers.customersList');
          const fbItems1 = await coll1.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
          const fbTotal1 = await coll1.countDocuments(filters);
          console.log(`[customers] fallback 'customers.customersList' -> total=${fbTotal1} items=${fbItems1.length}`);
          if (fbTotal1 > 0) { items = fbItems1; total = fbTotal1; }
        } catch (e) { console.log('[customers] fallback1 error:', e.message); }
      }

      // Fallback 2: flat 'customers'
      if (total === 0) {
        try {
          const coll2 = mongoose.connection.db.collection('customers');
          const fbItems2 = await coll2.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
          const fbTotal2 = await coll2.countDocuments(filters);
          console.log(`[customers] fallback 'customers' -> total=${fbTotal2} items=${fbItems2.length}`);
          if (fbTotal2 > 0) { items = fbItems2; total = fbTotal2; }
        } catch (e) { console.log('[customers] fallback2 error:', e.message); }
      }

      // Fallback 3: explicitly switch DB to 'customers' and read 'customersList'
      if (total === 0) {
        try {
          const db = mongoose.connection.useDb('customers', { useCache: true });
          const coll3 = db.collection('customersList');
          const fbItems3 = await coll3.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray();
          const fbTotal3 = await coll3.countDocuments(filters);
          console.log(`[customers] fallback useDb('customers').customersList -> total=${fbTotal3} items=${fbItems3.length}`);
          if (fbTotal3 > 0) { items = fbItems3; total = fbTotal3; }
        } catch (e) { console.log('[customers] fallback3 error:', e.message); }
      }
    }

    const transformed = items.map((c) => ({
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName: c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
    }));

    res.json({
      success: true,
      data: transformed,
      items: transformed, // backward compat for FE using items
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error in GET /api/customers:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: err.message });
  }
});

// GET /api/customers/:id (supports ObjectId or email)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let customer = null;
    if (Types.ObjectId.isValid(id)) {
      customer = await Customer.findById(id);
    }
    if (!customer) {
      customer = await Customer.findOne({ email: id.toLowerCase() });
    }
    // Fallback 0: customersList in current DB
    if (!customer) {
      try {
        const coll0 = mongoose.connection.db.collection('customersList');
        if (Types.ObjectId.isValid(id)) customer = await coll0.findOne({ _id: new Types.ObjectId(id) });
        if (!customer) customer = await coll0.findOne({ email: id.toLowerCase() });
      } catch (e) { console.log('[customers/:id] fb0 error:', e.message); }
    }
    // Fallback 1: dotted customers.customersList
    if (!customer) {
      try {
        const coll1 = mongoose.connection.db.collection('customers.customersList');
        if (Types.ObjectId.isValid(id)) customer = await coll1.findOne({ _id: new Types.ObjectId(id) });
        if (!customer) customer = await coll1.findOne({ email: id.toLowerCase() });
      } catch (e) { console.log('[customers/:id] fb1 error:', e.message); }
    }
    // Fallback 2: flat customers
    if (!customer) {
      try {
        const coll2 = mongoose.connection.db.collection('customers');
        if (Types.ObjectId.isValid(id)) customer = await coll2.findOne({ _id: new Types.ObjectId(id) });
        if (!customer) customer = await coll2.findOne({ email: id.toLowerCase() });
      } catch (e) { console.log('[customers/:id] fb2 error:', e.message); }
    }
    // Fallback 3: switch DB to 'customers'
    if (!customer) {
      try {
        const db = mongoose.connection.useDb('customers', { useCache: true });
        const coll3 = db.collection('customersList');
        if (Types.ObjectId.isValid(id)) customer = await coll3.findOne({ _id: new Types.ObjectId(id) });
        if (!customer) customer = await coll3.findOne({ email: id.toLowerCase() });
      } catch (e) { console.log('[customers/:id] fb3 error:', e.message); }
    }
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const c = customer.toObject ? customer.toObject() : customer;
    const transformed = {
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName: c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
      phone: c.phone,
      addresses: c.addresses || [],
      loyalty: c.loyalty,
      consents: c.consents,
      preferences: c.preferences,
      createdAt: c.createdAt || null,
      updatedAt: c.updatedAt || null,
      lastLoginAt: c.lastLoginAt || null,
      tags: c.tags || [],
      notes: c.notes || '',
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer', error: err.message });
  }
});

// GET /api/customers/:id/orders - list orders belonging to this customer (by _id or email)
router.get('/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    const filters = [];
    if (Types.ObjectId.isValid(id)) {
      filters.push({ customerId: new Types.ObjectId(id) });
    }
    // also accept string id stored in customerId
    filters.push({ customerId: String(id) });

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    let [items, total] = await Promise.all([
      Order.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ $or: filters })
    ]);

    // Fallback: dotted collection 'orders.ordersList'
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        const fbItems = await coll.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) { items = fbItems; total = fbTotal; }
      } catch {}
    }

    // Fallback by email if orders stored with customerEmail
    if (total === 0) {
      try {
        let email = null;
        if (id.includes('@')) email = id.toLowerCase();
        if (!email && Types.ObjectId.isValid(id)) {
          // Resolve email via multiple fallbacks like detail endpoint
          let c = await Customer.findById(id).lean().catch(() => null);
          if (!c) {
            try {
              const coll0 = mongoose.connection.db.collection('customersList');
              c = await coll0.findOne({ _id: new Types.ObjectId(id) });
            } catch {}
          }
          if (!c) {
            try {
              const coll1 = mongoose.connection.db.collection('customers.customersList');
              c = await coll1.findOne({ _id: new Types.ObjectId(id) });
            } catch {}
          }
          if (!c) {
            try {
              const coll2 = mongoose.connection.db.collection('customers');
              c = await coll2.findOne({ _id: new Types.ObjectId(id) });
            } catch {}
          }
          if (!c) {
            try {
              const db = mongoose.connection.useDb('customers', { useCache: true });
              const coll3 = db.collection('customersList');
              c = await coll3.findOne({ _id: new Types.ObjectId(id) });
            } catch {}
          }
          if (c?.email) email = String(c.email).toLowerCase();
        }
        if (email) {
          const byEmail = await Promise.all([
            Order.find({ customerEmail: new RegExp(`^${email}$`, 'i') }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Order.countDocuments({ customerEmail: new RegExp(`^${email}$`, 'i') })
          ]);
          items = byEmail[0]; total = byEmail[1];
          if (total === 0) {
            const coll = mongoose.connection.db.collection('orders.ordersList');
            const fbItems = await coll.find({ customerEmail: new RegExp(`^${email}$`, 'i') }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
            const fbTotal = await coll.countDocuments({ customerEmail: new RegExp(`^${email}$`, 'i') });
            if (fbTotal > 0) { items = fbItems; total = fbTotal; }
          }
        }
      } catch {}
    }

    const transformed = items.map(o => ({
      id: String(o._id || o.id || ''),
      customerEmail: o.customerEmail,
      total: o.total,
      currency: o.currency || 'VND',
      status: o.status || 'created',
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod,
    }));

    res.json({ success: true, data: transformed, items: transformed, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders', error: err.message });
  }
});

module.exports = router;


