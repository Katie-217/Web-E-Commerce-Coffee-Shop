// backend/routes/customers.js
const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose;
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const router = express.Router();

function toPlain(doc) {
  return doc && doc.toObject ? doc.toObject() : doc;
}

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

/**
 * GET /api/customers
 * Query: q (text search), page, limit
 * Hợp nhất logic từ 2 file:
 *  - thử Customer model
 *  - rồi fallback qua các collection khác (customersList, customers.customersList, customers, useDb('customers').customersList)
 */
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

    let items = [];
    let total = 0;

    // Try 1: Customer model (collection mặc định)
    try {
      [items, total] = await Promise.all([
        Customer.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Customer.countDocuments(filters)
      ]);
    } catch (err) {
      console.log('[customers] model error:', err.message);
    }

    // Try 2: current DB > customersList
    if (total === 0) {
      try {
        const coll0 = mongoose.connection.db.collection('customersList');
        const totalCount = await coll0.countDocuments({});
        if (totalCount > 0) {
          [items, total] = await Promise.all([
            coll0.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            coll0.countDocuments(filters)
          ]);
          if (total === 0 && totalCount > 0) {
            [items, total] = await Promise.all([
              coll0.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
              coll0.countDocuments({})
            ]);
          }
        }
      } catch (err) {
        console.log('[customers] fallback customersList error:', err.message);
      }
    }

    // Try 3: current DB > 'customers.customersList'
    if (total === 0) {
      try {
        const coll1 = mongoose.connection.db.collection('customers.customersList');
        const totalCount = await coll1.countDocuments({});
        if (totalCount > 0) {
          [items, total] = await Promise.all([
            coll1.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            coll1.countDocuments(filters)
          ]);
          if (total === 0 && totalCount > 0) {
            [items, total] = await Promise.all([
              coll1.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
              coll1.countDocuments({})
            ]);
          }
        }
      } catch (err) {
        console.log('[customers] fallback customers.customersList error:', err.message);
      }
    }

    // Try 4: current DB > 'customers' collection
    if (total === 0) {
      try {
        const coll2 = mongoose.connection.db.collection('customers');
        const totalCount = await coll2.countDocuments({});
        if (totalCount > 0) {
          [items, total] = await Promise.all([
            coll2.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            coll2.countDocuments(filters)
          ]);
          if (total === 0 && totalCount > 0) {
            [items, total] = await Promise.all([
              coll2.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
              coll2.countDocuments({})
            ]);
          }
        }
      } catch (err) {
        console.log('[customers] fallback customers error:', err.message);
      }
    }

    // Try 5: useDb('customers') > customersList
    if (total === 0) {
      try {
        const customersDb = mongoose.connection.useDb('customers', { useCache: true });
        const coll3 = customersDb.collection('customersList');
        const totalCount = await coll3.countDocuments({});
        if (totalCount > 0) {
          [items, total] = await Promise.all([
            coll3.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
            coll3.countDocuments(filters)
          ]);
          if (total === 0 && totalCount > 0) {
            [items, total] = await Promise.all([
              coll3.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
              coll3.countDocuments({})
            ]);
          }
        }
      } catch (err) {
        console.log("[customers] fallback useDb('customers').customersList error:", err.message);
      }
    }

    const transformed = items.map((c) => {
      const plain = toPlain(c);
      return {
        _id: plain._id ? String(plain._id) : undefined,
        id: String(plain._id || plain.id),
        fullName:
          plain.fullName ||
          [plain.firstName, plain.lastName].filter(Boolean).join(' '),
        email: plain.email,
        avatarUrl: plain.avatarUrl,
        status: plain.status || 'active',
        country:
          plain.country ||
          plain.addresses?.[0]?.country ||
          plain.address?.country ||
          plain.billingAddress?.country ||
          plain.shippingAddress?.country,
        addresses: plain.addresses || [],
        address: plain.address,
        billingAddress: plain.billingAddress,
        shippingAddress: plain.shippingAddress,
        createdAt: plain.createdAt || null,
        joinedAt: plain.joinedAt || plain.createdAt || null,
      };
    });

    res.json({
      success: true,
      data: transformed,
      items: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error in GET /api/customers:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: err.message,
    });
  }
});

/**
 * GET /api/customers/:id
 * - Hỗ trợ tìm theo ObjectId hoặc email
 * - Dùng logic fallback đầy đủ + trả về nhiều field (phone, addresses, loyalty,...)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let customer = null;

    // Try 1: useDb('customers').customersList
    try {
      const customersDb = mongoose.connection.useDb('customers', {
        useCache: true,
      });
      const coll = customersDb.collection('customersList');
      if (Types.ObjectId.isValid(id)) {
        customer = await coll.findOne({ _id: new Types.ObjectId(id) });
      }
      if (!customer) {
        customer = await coll.findOne({ email: id.toLowerCase() });
      }
    } catch (err) {
      console.log("[customers/:id] useDb('customers').customersList error:", err.message);
    }

    // Try 2: current DB > 'customersList'
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
        console.log("[customers/:id] customersList error:", err.message);
      }
    }

    // Try 3: current DB > 'customers.customersList'
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
        console.log("[customers/:id] customers.customersList error:", err.message);
      }
    }

    // Try 4: current DB > 'customers'
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
        console.log("[customers/:id] customers error:", err.message);
      }
    }

    // Fallback: Customer model
    if (!customer) {
      try {
        if (Types.ObjectId.isValid(id)) {
          customer = await Customer.findById(id);
        }
        if (!customer) {
          customer = await Customer.findOne({ email: id.toLowerCase() });
        }
      } catch (err) {
        console.log('[customers/:id] model error:', err.message);
      }
    }

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: 'Customer not found' });
    }

    const c = toPlain(customer);
    const transformed = {
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName:
        c.fullName ||
        [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
      phone: c.phone,
      country:
        c.country ||
        c.addresses?.[0]?.country ||
        c.address?.country ||
        c.billingAddress?.country ||
        c.shippingAddress?.country,
      addresses: c.addresses || [],
      address: c.address,
      billingAddress: c.billingAddress,
      shippingAddress: c.shippingAddress,
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: err.message,
    });
  }
});

/**
 * GET /api/customers/:id/orders
 * - ghép logic nhiều DB/collection cho orders
 */
router.get('/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );
    const skip = (page - 1) * limit;

    // Resolve email nếu có thể
    let customerEmail = null;
    if (id.includes('@')) {
      customerEmail = id.toLowerCase();
    } else if (Types.ObjectId.isValid(id)) {
      try {
        const objId = new Types.ObjectId(id);

        // giống logic detail: thử nhiều nơi để lấy customer
        let c = null;
        try {
          const customersDb = mongoose.connection.useDb('customers', {
            useCache: true,
          });
          c = await customersDb
            .collection('customersList')
            .findOne({ _id: objId });
        } catch {}

        if (!c) {
          try {
            c = await mongoose.connection.db
              .collection('customersList')
              .findOne({ _id: objId });
          } catch {}
        }

        if (!c) {
          try {
            c = await mongoose.connection.db
              .collection('customers.customersList')
              .findOne({ _id: objId });
          } catch {}
        }

        if (!c) {
          try {
            c = await mongoose.connection.db
              .collection('customers')
              .findOne({ _id: objId });
          } catch {}
        }

        if (!c) {
          c = await Customer.findById(id).lean().catch(() => null);
        }

        if (c?.email) {
          customerEmail = String(c.email).toLowerCase();
        }
      } catch {}
    }

    // Build filters
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

    // Try 1: Order model
    try {
      [items, total] = await Promise.all([
        Order.find({ $or: filters })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments({ $or: filters }),
      ]);
    } catch (err) {
      console.log('[customers/:id/orders] model Order error:', err.message);
    }

    // Try 2: useDb('orders').ordersList
    if (total === 0) {
      try {
        const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
        const coll = ordersDb.collection('ordersList');
        const fbItems = await coll
          .find({ $or: filters })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
        console.log("[customers/:id/orders] useDb('orders').ordersList error:", err.message);
      }
    }

    // Try 3: current DB > ordersList
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
        const fbItems = await coll
          .find({ $or: filters })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
        console.log('[customers/:id/orders] ordersList error:', err.message);
      }
    }

    // Try 4: current DB > orders.ordersList
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        const fbItems = await coll
          .find({ $or: filters })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
        console.log('[customers/:id/orders] orders.ordersList error:', err.message);
      }
    }

    // Try 5: current DB > orders
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('orders');
        const fbItems = await coll
          .find({ $or: filters })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();
        const fbTotal = await coll.countDocuments({ $or: filters });
        if (fbTotal > 0) {
          items = fbItems;
          total = fbTotal;
        }
      } catch (err) {
        console.log('[customers/:id/orders] orders error:', err.message);
      }
    }

    const transformed = items.map((o) => {
      const plain = toPlain(o);
      return {
        _id: plain._id ? String(plain._id) : undefined,
        id: String(plain._id || plain.id || ''),
        customerId: plain.customerId ? String(plain.customerId) : undefined,
        customerEmail: plain.customerEmail,
        customerName: plain.customerName,
        total: plain.total || 0,
        subtotal: plain.subtotal,
        discount: plain.discount,
        shippingFee: plain.shippingFee,
        currency: plain.currency || 'VND',
        status: plain.status || 'created',
        paymentStatus: plain.paymentStatus || 'pending',
        paymentMethod: plain.paymentMethod,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        items: plain.items || [],
      };
    });

    res.json({
      success: true,
      data: transformed,
      items: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: err.message,
    });
  }
});

/**
 * POST /api/customers
 * - Tạo customer mới (lấy logic tạo từ file thứ 2)
 */
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

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required',
      });
    }

    const customerFullName = fullName || `${firstName} ${lastName}`.trim();

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

    let customer = null;

    // Try 1: Customer model
    try {
      customer = new Customer(customerData);
      await customer.save();
    } catch (err) {
      if (err.code === 11000 || err.message?.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }

      // Try 2: useDb('customers').customersList
      try {
        const customersDb = mongoose.connection.useDb('customers', {
          useCache: true,
        });
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

        // Try 3: current DB > customersList
        const coll = mongoose.connection.db.collection('customersList');
        const result = await coll.insertOne({
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        customer = { _id: result.insertedId, ...customerData };
      }
    }

    const c = toPlain(customer);
    const transformed = {
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName:
        c.fullName ||
        [c.firstName, c.lastName].filter(Boolean).join(' '),
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

/**
 * PATCH /api/customers/:id
 * - Update customer (từ file thứ 2)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    delete updateData._id;
    delete updateData.id;

    updateData.updatedAt = new Date();

    let updated = false;
    let updatedCustomer = null;

    // Try 1: useDb('customers').customersList
    try {
      const customersDb = mongoose.connection.useDb('customers', {
        useCache: true,
      });
      const coll = customersDb.collection('customersList');
      if (Types.ObjectId.isValid(id)) {
        const result = await coll.findOneAndUpdate(
          { _id: new Types.ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        if (result && result.value) {
          updated = true;
          updatedCustomer = result.value;
        }
      }
      if (!updated) {
        const result = await coll.findOneAndUpdate(
          { email: id.toLowerCase() },
          { $set: updateData },
          { returnDocument: 'after' }
        );
        if (result && result.value) {
          updated = true;
          updatedCustomer = result.value;
        }
      }
    } catch (err) {
      console.error("Error updating in 'customers' database:", err.message);
    }

    // Try 2: current DB > customersList
    if (!updated) {
      try {
        const coll = mongoose.connection.db.collection('customersList');
        if (Types.ObjectId.isValid(id)) {
          const result = await coll.findOneAndUpdate(
            { _id: new Types.ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
          );
          if (result && result.value) {
            updated = true;
            updatedCustomer = result.value;
          }
        }
        if (!updated) {
          const result = await coll.findOneAndUpdate(
            { email: id.toLowerCase() },
            { $set: updateData },
            { returnDocument: 'after' }
          );
          if (result && result.value) {
            updated = true;
            updatedCustomer = result.value;
          }
        }
      } catch (err) {
        console.error(
          'Error updating in current database customersList:',
          err.message
        );
      }
    }

    // Try 3: Customer model
    if (!updated) {
      try {
        if (Types.ObjectId.isValid(id)) {
          updatedCustomer = await Customer.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
          );
          if (updatedCustomer) {
            updated = true;
          }
        }
        if (!updated) {
          updatedCustomer = await Customer.findOneAndUpdate(
            { email: id.toLowerCase() },
            { $set: updateData },
            { new: true }
          );
          if (updatedCustomer) {
            updated = true;
          }
        }
      } catch (err) {
        console.error('Error updating in default Customer model:', err.message);
      }
    }

    if (!updated || !updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id: ${id}`,
      });
    }

    const c = toPlain(updatedCustomer);
    const transformed = {
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName:
        c.fullName ||
        [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
      phone: c.phone,
      country:
        c.country ||
        c.addresses?.[0]?.country ||
        c.address?.country ||
        c.billingAddress?.country ||
        c.shippingAddress?.country,
      addresses: c.addresses || [],
      address: c.address,
      billingAddress: c.billingAddress,
      shippingAddress: c.shippingAddress,
      loyalty: c.loyalty,
      consents: c.consents,
      preferences: c.preferences,
      createdAt: c.createdAt || null,
      updatedAt: c.updatedAt || null,
      lastLoginAt: c.lastLoginAt || null,
      tags: c.tags || [],
      notes: c.notes || '',
    };

    res.json({
      success: true,
      data: transformed,
      message: 'Customer updated successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: err.message,
    });
  }
});

module.exports = router;
