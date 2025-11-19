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

    // Try different databases: 'customers' database first, then 'CoffeeDB'
    let items = [];
    let total = 0;
    
    // Try 1: 'customers' database > 'customersList' collection
    try {
      const customersDb = mongoose.connection.useDb('customers', { useCache: true });
      const coll = customersDb.collection('customersList');
      const totalCount = await coll.countDocuments({});
      if (totalCount > 0) {
        [items, total] = await Promise.all([
          coll.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
          coll.countDocuments(filters)
        ]);
        if (total === 0 && totalCount > 0) {
          [items, total] = await Promise.all([
            coll.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            coll.countDocuments({})
          ]);
        }
      }
    } catch (err) {
    }
    
    // Try 2: Current database (CoffeeDB) > customersList collection
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('customersList');
        const totalCount = await coll.countDocuments({});
        if (totalCount > 0) {
          [items, total] = await Promise.all([
            coll.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            coll.countDocuments(filters)
          ]);
          if (total === 0 && totalCount > 0) {
            [items, total] = await Promise.all([
              coll.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
              coll.countDocuments({})
            ]);
          }
        }
      } catch (err) {
      }
    }

    // Fallback to default Customer model collection
    if (total === 0) {
      try {
        [items, total] = await Promise.all([
          Customer.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
          Customer.countDocuments(filters)
        ]);
      } catch (err) {
      }
    }

    const transformed = items.map((c) => ({
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName: c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
      country: c.country || c.addresses?.[0]?.country || c.address?.country || c.billingAddress?.country || c.shippingAddress?.country,
      addresses: c.addresses || [],
      address: c.address,
      billingAddress: c.billingAddress,
      shippingAddress: c.shippingAddress,
      createdAt: c.createdAt || null,
      joinedAt: c.joinedAt || c.createdAt || null,
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
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: err.message });
  }
});

// GET /api/customers/:id (supports ObjectId or email)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let customer = null;
    if (!customer) {
      try {
        const customersDb = mongoose.connection.useDb('customers', { useCache: true });
        const coll = customersDb.collection('customersList');
        if (Types.ObjectId.isValid(id)) {
          customer = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!customer) {
          customer = await coll.findOne({ email: id.toLowerCase() });
        }
      } catch (err) {
      }
    }
    
    // Try 2: Current database (CoffeeDB) > 'customersList' collection
    if (!customer) {
      try {
        const coll = mongoose.connection.db.collection('customersList');
        if (Types.ObjectId.isValid(id)) {
          customer = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!customer) {
          customer = await coll.findOne({ email: id.toLowerCase() });
        }
      } catch (err) {
      }
    }
    
    // Try 3: Current database > 'customers.customersList' collection
    if (!customer) {
      try {
        const coll = mongoose.connection.db.collection('customers.customersList');
        if (Types.ObjectId.isValid(id)) {
          customer = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!customer) {
          customer = await coll.findOne({ email: id.toLowerCase() });
        }
      } catch (err) {
      }
    }
    
    // Try 4: Current database > 'customers' collection
    if (!customer) {
      try {
        const coll = mongoose.connection.db.collection('customers');
        if (Types.ObjectId.isValid(id)) {
          customer = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!customer) {
          customer = await coll.findOne({ email: id.toLowerCase() });
        }
      } catch (err) {
      }
    }
    
    // Fallback to default Customer model collection
    if (!customer) {
      try {
        if (Types.ObjectId.isValid(id)) {
          customer = await Customer.findById(id);
        }
        if (!customer) {
          customer = await Customer.findOne({ email: id.toLowerCase() });
        }
      } catch (err) {
      }
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
    
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    // First, try to get customer email if we have customer ID
    let customerEmail = null;
    if (id.includes('@')) {
      customerEmail = id.toLowerCase();
    } else if (Types.ObjectId.isValid(id)) {
      // Try to resolve email from customer ID (same logic as detail endpoint)
      try {
        const customersDb = mongoose.connection.useDb('customers', { useCache: true });
        let c = await customersDb.collection('customersList').findOne({ _id: new Types.ObjectId(id) });
        if (!c) {
          c = await mongoose.connection.db.collection('customersList').findOne({ _id: new Types.ObjectId(id) });
        }
        if (!c) {
          c = await mongoose.connection.db.collection('customers.customersList').findOne({ _id: new Types.ObjectId(id) });
        }
        if (!c) {
          c = await mongoose.connection.db.collection('customers').findOne({ _id: new Types.ObjectId(id) });
        }
        if (!c) {
          c = await Customer.findById(id).lean().catch(() => null);
        }
        if (c?.email) {
          customerEmail = String(c.email).toLowerCase();
        }
      } catch (err) {
      }
    }

    // Build filters - search by both customerId and customerEmail
    const filters = [];
    if (Types.ObjectId.isValid(id)) {
      filters.push({ customerId: new Types.ObjectId(id) });
      filters.push({ customerId: String(id) });
    } else {
      filters.push({ customerId: String(id) });
    }
    if (customerEmail) {
      filters.push({ customerEmail: new RegExp(`^${customerEmail}$`, 'i') });
      filters.push({ customerEmail: customerEmail.toLowerCase() });
    }

    let items = [];
    let total = 0;

    // Try 1: Default Order model
    try {
      [items, total] = await Promise.all([
        Order.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Order.countDocuments({ $or: filters })
      ]);
    } catch (err) {
    }

    // Try 2: 'orders' database > 'ordersList' collection
    if (total === 0) {
      try {
        const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
        const coll = ordersDb.collection('ordersList');
        const fbItems = await coll.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
      }
    }

    // Try 3: Current database > 'ordersList' collection
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
        const fbItems = await coll.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
      }
    }

    // Try 4: Current database > 'orders.ordersList' collection
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        const fbItems = await coll.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
      }
    }

    // Try 5: Current database > 'orders' collection
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('orders');
        const fbItems = await coll.find({ $or: filters }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
      }
    }

    const transformed = items.map(o => ({
      _id: o._id ? String(o._id) : undefined,
      id: String(o._id || o.id || ''),
      customerId: o.customerId ? String(o.customerId) : undefined,
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      total: o.total || 0,
      subtotal: o.subtotal,
      discount: o.discount,
      shippingFee: o.shippingFee,
      currency: o.currency || 'VND',
      status: o.status || 'created',
      paymentStatus: o.paymentStatus || 'pending',
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items || [],
    }));

    res.json({ success: true, data: transformed, items: transformed, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders', error: err.message });
  }
});

// POST /api/customers - Create a new customer
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      avatarUrl,
      addresses,
      paymentMethods,
      status,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required',
      });
    }

    // Generate fullName if not provided
    const customerFullName = fullName || `${firstName} ${lastName}`.trim();

    // Prepare customer data
    const customerData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: customerFullName,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      gender: gender || 'other',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      avatarUrl: avatarUrl || undefined,
      addresses: addresses || [],
      paymentMethods: paymentMethods || [],
      status: status || 'active',
    };

    // Try to save to default Customer model first
    let customer = null;
    try {
      customer = new Customer(customerData);
      await customer.save();
    } catch (err) {
      // If email already exists, return error
      if (err.code === 11000 || err.message?.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
      
      // Try to save to customersList collection
      try {
        const customersDb = mongoose.connection.useDb('customers', { useCache: true });
        const coll = customersDb.collection('customersList');
        const result = await coll.insertOne({
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        customer = { _id: result.insertedId, ...customerData };
      } catch (err2) {
        if (err2.code === 11000 || err2.message?.includes('duplicate')) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists',
          });
        }
        
        // Try current database
        try {
          const coll = mongoose.connection.db.collection('customersList');
          const result = await coll.insertOne({
            ...customerData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          customer = { _id: result.insertedId, ...customerData };
        } catch (err3) {
          if (err3.code === 11000 || err3.message?.includes('duplicate')) {
            return res.status(400).json({
              success: false,
              message: 'Email already exists',
            });
          }
          throw err3;
        }
      }
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
      createdAt: c.createdAt || null,
      updatedAt: c.updatedAt || null,
    };

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: transformed,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: err.message,
    });
  }
});

module.exports = router;


