const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose;
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const router = express.Router();

// Helper function to find customer and return location info
async function findCustomerWithLocation(id) {
  let customer = null;
  let location = null;
  
  // Try 1: 'customers' database > 'customersList' collection
  try {
    const customersDb = mongoose.connection.useDb('customers', { useCache: true });
    const coll = customersDb.collection('customersList');
    if (Types.ObjectId.isValid(id)) {
      customer = await coll.findOne({ _id: new Types.ObjectId(id) });
    }
    if (!customer) {
      customer = await coll.findOne({ email: id.toLowerCase() });
    }
    if (customer) {
      location = { type: 'database', dbName: 'customers', collection: 'customersList', db: customersDb, coll: coll };
      return { customer, location };
    }
  } catch (err) {
    console.error('Error searching in customers database:', err);
  }
  
  // Try 2: Current database (CoffeeDB) > 'customersList' collection
  try {
    const coll = mongoose.connection.db.collection('customersList');
    if (Types.ObjectId.isValid(id)) {
      customer = await coll.findOne({ _id: new Types.ObjectId(id) });
    }
    if (!customer) {
      customer = await coll.findOne({ email: id.toLowerCase() });
    }
    if (customer) {
      location = { type: 'current', dbName: mongoose.connection.db.databaseName, collection: 'customersList', db: mongoose.connection.db, coll: coll };
      return { customer, location };
    }
  } catch (err) {
    console.error('Error searching in current database customersList:', err);
  }
  
  // Try 3: Current database > 'customers.customersList' collection
  try {
    const coll = mongoose.connection.db.collection('customers.customersList');
    if (Types.ObjectId.isValid(id)) {
      customer = await coll.findOne({ _id: new Types.ObjectId(id) });
    }
    if (!customer) {
      customer = await coll.findOne({ email: id.toLowerCase() });
    }
    if (customer) {
      location = { type: 'current', dbName: mongoose.connection.db.databaseName, collection: 'customers.customersList', db: mongoose.connection.db, coll: coll };
      return { customer, location };
    }
  } catch (err) {
    console.error('Error searching in customers.customersList:', err);
  }
  
  // Try 4: Current database > 'customers' collection
  try {
    const coll = mongoose.connection.db.collection('customers');
    if (Types.ObjectId.isValid(id)) {
      customer = await coll.findOne({ _id: new Types.ObjectId(id) });
    }
    if (!customer) {
      customer = await coll.findOne({ email: id.toLowerCase() });
    }
    if (customer) {
      location = { type: 'current', dbName: mongoose.connection.db.databaseName, collection: 'customers', db: mongoose.connection.db, coll: coll };
      return { customer, location };
    }
  } catch (err) {
    console.error('Error searching in customers collection:', err);
  }
  
  // Fallback to default Customer model collection
  try {
    if (Types.ObjectId.isValid(id)) {
      customer = await Customer.findById(id);
    }
    if (!customer) {
      customer = await Customer.findOne({ email: id.toLowerCase() });
    }
    if (customer) {
      location = { type: 'model', model: Customer };
      return { customer, location };
    }
  } catch (err) {
    console.error('Error searching in Customer model:', err);
  }
  
  return { customer: null, location: null };
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

    const { customer, location } = await findCustomerWithLocation(id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const c = customer.toObject ? customer.toObject() : customer;
    const transformed = {
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName: c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' '),
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
      phone: c.phone,
      gender: c.gender || 'other',
      country: c.country || c.addresses?.[0]?.country || c.address?.country || c.billingAddress?.country || c.shippingAddress?.country,
      addresses: c.addresses || [],
      address: c.address,
      billingAddress: c.billingAddress,
      shippingAddress: c.shippingAddress,
      loyalty: c.loyalty,
      wishlist: c.wishlist || [],
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
      displayCode: (o.displayCode && typeof o.displayCode === 'string' && o.displayCode.trim().length > 0) ? String(o.displayCode).trim() : null, // 4-character alphanumeric code for display
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

    // Prevent duplicates
    const existingCustomer = await findCustomerWithLocation(email);
    if (existingCustomer.customer) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
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

    // Helper to format duplicate email response
    const duplicateResponse = () => ({
      success: false,
      message: 'Email already exists',
    });

    // Try to save to customers database first (primary dataset)
    let customer = null;
    try {
      const customersDb = mongoose.connection.useDb('customers', { useCache: true });
      const coll = customersDb.collection('customersList');
      const now = new Date();
      const result = await coll.insertOne({
        ...customerData,
        createdAt: now,
        updatedAt: now,
      });
      customer = { _id: result.insertedId, ...customerData, createdAt: now, updatedAt: now };
    } catch (errPrimary) {
      if (errPrimary.code === 11000 || errPrimary.message?.includes('duplicate')) {
        return res.status(400).json(duplicateResponse());
      }

      // Try current database collection
      try {
        const coll = mongoose.connection.db.collection('customersList');
        const now = new Date();
        const result = await coll.insertOne({
          ...customerData,
          createdAt: now,
          updatedAt: now,
        });
        customer = { _id: result.insertedId, ...customerData, createdAt: now, updatedAt: now };
      } catch (errSecondary) {
        if (errSecondary.code === 11000 || errSecondary.message?.includes('duplicate')) {
          return res.status(400).json(duplicateResponse());
        }

        // Fallback to default Customer model
        try {
          customer = new Customer(customerData);
          await customer.save();
        } catch (modelErr) {
          if (modelErr.code === 11000 || modelErr.message?.includes('duplicate')) {
            return res.status(400).json(duplicateResponse());
          }
          throw modelErr;
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

// PATCH /api/customers/:id - Update customer
// IMPORTANT: This endpoint ONLY updates existing customer documents
// It does NOT create new documents (no upsert option)
// If customer not found, returns 404 error
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove _id from updateData if present (cannot update _id)
    delete updateData._id;
    delete updateData.id;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // CRITICAL: Find customer first to know where it's stored
    const { customer: existingCustomer, location } = await findCustomerWithLocation(id);
    
    if (!existingCustomer || !location) {
      console.error('❌ Customer not found with id:', id);
      return res.status(404).json({
        success: false,
        message: `Customer not found with id: ${id}`,
      });
    }
    
    let updated = false;
    let updatedCustomer = null;
    let updateLocation = '';

    // Update in the SAME location where customer was found
    try {
      if (location.type === 'database' || location.type === 'current') {
        // Update using collection
        const coll = location.coll;
        const query = Types.ObjectId.isValid(id) 
          ? { _id: new Types.ObjectId(id) }
          : { email: id.toLowerCase() };
        
        // Use updateOne to ensure update is committed
        const updateResult = await coll.updateOne(
          query,
          { $set: updateData }
        );
        
        if (updateResult.matchedCount > 0 && updateResult.acknowledged) {
          // Wait a bit to ensure write is committed
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Fetch the updated document
          const result = await coll.findOne(query);
          if (result) {
            // Verify the update
            const verifyResult = await coll.findOne(query);
            if (!verifyResult || JSON.stringify(verifyResult.addresses) !== JSON.stringify(result.addresses)) {
              console.error('❌ VERIFICATION FAILED');
            }
            
            updated = true;
            updatedCustomer = result;
            updateLocation = `${location.dbName || 'current'} > ${location.collection}`;
          }
        } else {
          console.error('❌ Update failed: matchedCount:', updateResult.matchedCount, 'acknowledged:', updateResult.acknowledged);
        }
      } else if (location.type === 'model') {
        // Update using Mongoose model
        const query = Types.ObjectId.isValid(id)
          ? { _id: id }
          : { email: id.toLowerCase() };
        
        updatedCustomer = await Customer.findOneAndUpdate(
          query,
          { $set: updateData },
          { new: true }
        );
        
        if (updatedCustomer) {
          updated = true;
          updateLocation = 'Customer model';
        }
      }
    } catch (err) {
      console.error('❌ Error updating customer:', err);
      throw err;
    }

    if (!updated || !updatedCustomer) {
      console.error('❌ Failed to update customer');
      return res.status(500).json({
        success: false,
        message: 'Failed to update customer',
      });
    }

    // CRITICAL: Verify the update was actually saved to MongoDB using the same location
    const query = Types.ObjectId.isValid(id) 
      ? { _id: new Types.ObjectId(id) }
      : { email: id.toLowerCase() };
    
    if (location.type === 'database' || location.type === 'current') {
      const verifyColl = location.coll;
      const verifyDoc = await verifyColl.findOne(query);
      if (verifyDoc) {
        if (JSON.stringify(verifyDoc.addresses) !== JSON.stringify(updatedCustomer.addresses)) {
          console.error('❌ VERIFICATION WARNING: Addresses do not match!');
          console.error('Expected:', JSON.stringify(updatedCustomer.addresses, null, 2));
          console.error('Actual:', JSON.stringify(verifyDoc.addresses, null, 2));
        }
      } else {
        console.error('❌ VERIFICATION FAILED: Document not found after update');
      }
    } else if (location.type === 'model') {
      const verifyDoc = await Customer.findOne(query);
      if (!verifyDoc) {
        console.error('❌ VERIFICATION FAILED: Document not found in Customer model');
      }
    }

    const c = updatedCustomer.toObject ? updatedCustomer.toObject() : updatedCustomer;
    const transformed = {
      _id: c._id ? String(c._id) : undefined,
      id: String(c._id || c.id),
      fullName: c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      avatarUrl: c.avatarUrl,
      status: c.status || 'active',
      phone: c.phone,
      country: c.country || c.addresses?.[0]?.country || c.address?.country || c.billingAddress?.country || c.shippingAddress?.country,
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

    res.json({ success: true, data: transformed, message: 'Customer updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update customer', error: err.message });
  }
});

// DELETE /api/customers/:id - Delete customer from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer, location } = await findCustomerWithLocation(id);

    if (!customer || !location) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id: ${id}`,
      });
    }

    const query = Types.ObjectId.isValid(id)
      ? { _id: new Types.ObjectId(id) }
      : { email: id.toLowerCase() };

    let deleted = false;

    if (location.type === 'database' || location.type === 'current') {
      const result = await location.coll.deleteOne(query);
      deleted = result.deletedCount > 0;
    } else if (location.type === 'model') {
      const result = await Customer.deleteOne(query);
      deleted = result.deletedCount > 0;
    }

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete customer',
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: err.message,
    });
  }
});

module.exports = router;


