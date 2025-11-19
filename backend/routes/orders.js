const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose;
const Order = require('../models/Order');

const router = express.Router();

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const { q, status, email, range, startDate, endDate } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (email) filters.customerEmail = new RegExp(String(email), 'i');
    if (q) {
      filters.$or = [
        { id: { $regex: q, $options: 'i' } },
        { customerEmail: { $regex: q, $options: 'i' } }
      ];
    }

    // Time range filtering
    const now = new Date();
    let rangeStart = null;
    let rangeEnd = null;
    const normalizeStart = (d) => (d ? new Date(d) : null);
    const normalizeEnd = (d) => {
      if (!d) return null;
      const e = new Date(d);
      e.setHours(23, 59, 59, 999);
      return e;
    };
    if (range && typeof range === 'string') {
      const r = range.toLowerCase();
      const startOfDay = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
      };
      const startOfWeek = (d) => {
        const x = startOfDay(d);
        const day = x.getDay();
        const diff = (day + 6) % 7;
        x.setDate(x.getDate() - diff);
        return x;
      };
      const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

      if (r === 'today') {
        rangeStart = startOfDay(now);
        rangeEnd = normalizeEnd(now);
      } else if (r === 'yesterday') {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        rangeStart = startOfDay(y);
        rangeEnd = normalizeEnd(y);
      } else if (r === 'week') {
        rangeStart = startOfWeek(now);
        rangeEnd = normalizeEnd(now);
      } else if (r === 'month') {
        rangeStart = startOfMonth(now);
        rangeEnd = normalizeEnd(now);
      } else if (r === 'custom') {
        rangeStart = normalizeStart(startDate);
        rangeEnd = normalizeEnd(endDate || startDate);
      }
    }
    if (rangeStart || rangeEnd) {
      filters.createdAt = {};
      if (rangeStart) filters.createdAt.$gte = rangeStart;
      if (rangeEnd) filters.createdAt.$lte = rangeEnd;
    }

    
    // Try different databases: 'orders' database first, then 'CoffeeDB'
    let items = [];
    let total = 0;
    
    // Try 1: 'orders' database > 'ordersList' collection
    try {
      const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
      const coll = ordersDb.collection('ordersList');
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
    
    // Try 2: Current database (CoffeeDB) > ordersList collection
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
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

    // Fallback to default Order model collection
    if (total === 0) {
      try {
        [items, total] = await Promise.all([
          Order.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
          Order.countDocuments(filters)
        ]);
      } catch (err) {
      }
    }

    const transformed = items.map(o => ({
      _id: o._id ? String(o._id) : undefined,
      id: String(o._id || o.id || ''),
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      total: o.total,
      subtotal: o.subtotal,
      discount: o.discount,
      shippingFee: o.shippingFee,
      currency: o.currency || 'VND',
      status: o.status || 'created',
      paymentStatus: o.paymentStatus || 'pending',
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      ...(req.query && String(req.query.includeItems).toLowerCase() === 'true' ? { items: o.items || [] } : {}),
    }));

    res.json({ success: true, data: transformed, items: transformed, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;
    
    // Try collections in order: orders DB > ordersList, then current DB > ordersList, orders.ordersList, orders
    // Try 1: 'orders' database > 'ordersList' collection
    try {
      const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
      const coll = ordersDb.collection('ordersList');
      
      if (Types.ObjectId.isValid(id)) {
        const objId = new Types.ObjectId(id);
        order = await coll.findOne({ _id: objId });
      }
      if (!order) {
        order = await coll.findOne({ id: id });
      }
      if (!order) {
        // Also try with _id as string
        order = await coll.findOne({ _id: id });
      }
      if (!order && !isNaN(id)) {
        order = await coll.findOne({ id: String(id) });
      }
    } catch (err) {
    }
    
    // Try 2: Current database > ordersList collection
    if (!order) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
        if (Types.ObjectId.isValid(id)) {
          order = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!order) {
          order = await coll.findOne({ id });
        }
        if (!order && !isNaN(id)) {
          order = await coll.findOne({ id: String(id) });
        }
      } catch (err) {
      }
    }
    
    // Try 3: orders.ordersList
    if (!order) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        if (Types.ObjectId.isValid(id)) {
          order = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!order) {
          order = await coll.findOne({ id });
        }
        if (!order && !isNaN(id)) {
          order = await coll.findOne({ id: String(id) });
        }
      } catch (err) {
      }
    }
    
    // Try 3: orders
    if (!order) {
      try {
        const coll = mongoose.connection.db.collection('orders');
        if (Types.ObjectId.isValid(id)) {
          order = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!order) {
          order = await coll.findOne({ id });
        }
        if (!order && !isNaN(id)) {
          order = await coll.findOne({ id: String(id) });
        }
      } catch (err) {
      }
    }
    
    // Fallback to default Order model collection
    if (!order) {
      if (Types.ObjectId.isValid(id)) order = await Order.findById(id);
      if (!order) order = await Order.findOne({ id });
      if (!order && !isNaN(id)) order = await Order.findOne({ id: String(id) });
    }
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const o = order.toObject ? order.toObject() : order;
    const transformed = {
      _id: o._id ? String(o._id) : undefined,
      id: String(o._id || o.id || ''),
      customerEmail: o.customerEmail,
      customerId: o.customerId,
      items: o.items || [],
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discount: o.discount,
      tax: o.tax,
      total: o.total,
      currency: o.currency || 'VND',
      status: o.status || 'created',
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      shippingAddress: o.shippingAddress,
      billingAddress: o.billingAddress,
      shippingActivity: o.shippingActivity || [],
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: err.message });
  }
});

// PATCH /api/orders/:id - Update order status and/or shipping activity
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shippingActivity } = req.body;
    
    // Build update data
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (shippingActivity !== undefined) updateData.shippingActivity = shippingActivity;
    updateData.updatedAt = new Date();
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    // Use same logic as GET route to find order
    // Try collections in order: orders DB > ordersList, then current DB > ordersList, orders.ordersList, orders
    let updated = false;
    
    // Try 1: 'orders' database > 'ordersList' collection
    try {
      const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
      const coll = ordersDb.collection('ordersList');
      
      let result = null;
      
      if (Types.ObjectId.isValid(id)) {
        const objId = new Types.ObjectId(id);
        result = await coll.updateOne(
          { _id: objId },
          { $set: updateData }
        );
        if (result.matchedCount > 0) {
          updated = true;
        }
      }
      
      if (!updated) {
        result = await coll.updateOne(
          { id: id },
          { $set: updateData }
        );
        if (result.matchedCount > 0) {
          updated = true;
        }
      }
      
      if (!updated) {
        // Also try with _id as string
        result = await coll.updateOne(
          { _id: id },
          { $set: updateData }
        );
        if (result.matchedCount > 0) {
          updated = true;
        }
      }
      
      if (!updated && !isNaN(id)) {
        result = await coll.updateOne(
          { id: String(id) },
          { $set: updateData }
        );
        if (result.matchedCount > 0) {
          updated = true;
        }
      }
    } catch (err) {
    }
    
    // Try 2: Current database > ordersList collection
    if (!updated) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
        let result = null;
        
        if (Types.ObjectId.isValid(id)) {
          result = await coll.updateOne(
            { _id: new Types.ObjectId(id) },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
        
        if (!updated) {
          result = await coll.updateOne(
            { id },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
        
        if (!updated && !isNaN(id)) {
          result = await coll.updateOne(
            { id: String(id) },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
      } catch (err) {
      }
    }
    
    // Try 3: orders.ordersList
    if (!updated) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        let result = null;
        
        if (Types.ObjectId.isValid(id)) {
          result = await coll.updateOne(
            { _id: new Types.ObjectId(id) },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
        
        if (!updated) {
          result = await coll.updateOne(
            { id },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
        
        if (!updated && !isNaN(id)) {
          result = await coll.updateOne(
            { id: String(id) },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
      } catch (err) {
      }
    }
    
    // Try 4: orders
    if (!updated) {
      try {
        const coll = mongoose.connection.db.collection('orders');
        let result = null;
        
        if (Types.ObjectId.isValid(id)) {
          result = await coll.updateOne(
            { _id: new Types.ObjectId(id) },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
        
        if (!updated) {
          result = await coll.updateOne(
            { id },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
        
        if (!updated && !isNaN(id)) {
          result = await coll.updateOne(
            { id: String(id) },
            { $set: updateData }
          );
          if (result.matchedCount > 0) {
            updated = true;
          }
        }
      } catch (err) {
      }
    }
    
    // Fallback to Order model
    if (!updated) {
      if (Types.ObjectId.isValid(id)) {
        const order = await Order.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (order) {
          updated = true;
        }
      }
      if (!updated) {
        const order = await Order.findOneAndUpdate({ id }, { $set: updateData }, { new: true });
        if (order) {
          updated = true;
        }
      }
      if (!updated && !isNaN(id)) {
        const order = await Order.findOneAndUpdate({ id: String(id) }, { $set: updateData }, { new: true });
        if (order) {
          updated = true;
        }
      }
    }
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: `Order not found with id: ${id}`
      });
    }
    
    res.json({ success: true, message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
  }
});

module.exports = router;



