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
    const { q, status, email } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (email) filters.customerEmail = new RegExp(String(email), 'i');
    if (q) {
      filters.$or = [
        { id: { $regex: q, $options: 'i' } },
        { customerEmail: { $regex: q, $options: 'i' } }
      ];
    }

    let [items, total] = await Promise.all([
      Order.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filters)
    ]);

    // Fallback dotted collection 'orders.ordersList'
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        const fbItems = await coll.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
        const fbTotal = await coll.countDocuments(filters);
        if (fbTotal > 0) { items = fbItems; total = fbTotal; }
      } catch {}
    }

    const transformed = items.map(o => ({
      _id: o._id ? String(o._id) : undefined,
      id: String(o._id || o.id || ''),
      customerEmail: o.customerEmail,
      total: o.total,
      currency: o.currency || 'VND',
      status: o.status || 'created',
      createdAt: o.createdAt,
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
    if (Types.ObjectId.isValid(id)) order = await Order.findById(id);
    if (!order) order = await Order.findOne({ id });
    // Fallback direct collection
    if (!order) {
      try {
        const coll = mongoose.connection.db.collection('orders.ordersList');
        if (Types.ObjectId.isValid(id)) order = await coll.findOne({ _id: new Types.ObjectId(id) });
        if (!order) order = await coll.findOne({ id });
      } catch {}
    }
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const o = order.toObject ? order.toObject() : order;
    const transformed = {
      _id: o._id ? String(o._id) : undefined,
      id: String(o._id || o.id || ''),
      customerEmail: o.customerEmail,
      customerId: o.customerId,
      items: o.items || [],
      total: o.total,
      currency: o.currency || 'VND',
      status: o.status || 'created',
      shippingAddress: o.shippingAddress,
      billingAddress: o.billingAddress,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: err.message });
  }
});

module.exports = router;



