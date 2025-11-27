const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose;
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const {
  calculatePointsEarned,
  calculateDiscountFromPoints,
  validatePointsUsage
} = require('../utils/loyalty');

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
    // Only apply email filter if there's no search query (q parameter)
    // When searching by ID, we don't want to filter by email
    if (email && (!q || q === '' || String(q).trim() === '')) {
      filters.customerEmail = new RegExp(String(email), 'i');
    }
    
    // Handle search query - search ONLY in order ID
    // When user types, filter immediately and narrow down results
    // User can search by ID number without "#" - e.g., "1" or "0001" will find "ORD-2024-0001"
    // IMPORTANT: Only search in id field, NOT in customerEmail or any other field
    // UI displays ID as #XXXX (last 4 hex characters), so search should work with both:
    // - Full ID: "ORD-2024-0003"
    // - Display format: "0003" or "#0003" (last 4 characters)
    // When user types "3", prioritize orders with ID starting with "3" in the numeric part
    // Format: ORD-YYYY-NNNN, so "3" should match orders like ORD-2024-0003, ORD-2024-0030, ORD-2024-0300, ORD-2024-3000
    if (q !== undefined && q !== null && String(q).trim() !== '') {
      let searchTerm = String(q).trim();
      // Remove "#" if user typed it - allow searching without "#"
      searchTerm = searchTerm.replace(/^#+/, '');
      
      if (searchTerm) {
        // Escape special regex characters to prevent regex injection
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Search in displayCode field - 4-character alphanumeric code (e.g., "A3f2", "75a0")
        // UI displays ID as #XXXX where XXXX is the displayCode (used to hide real order ID)
        // When user types "A3", match displayCodes STARTING with "A3": "A3f2", "A3bc", etc.
        // When user types "75a", match displayCodes STARTING with "75a": "75a0", "75a1", etc.
        // Pattern: ^[searchTerm] matches displayCodes that start with the search term (case-insensitive)
        // Only search orders that have displayCode (not null/undefined)
        filters.displayCode = { 
          $exists: true,
          $ne: null,
          $regex: `^${escapedTerm}`, 
          $options: 'i' 
        };
      }
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

    
    // Determine sort order: if searching, sort by displayCode (alphabetical order), otherwise by createdAt
    // When searching, we want to prioritize orders where the search term appears at the beginning of displayCode
    let sortOrder = { createdAt: -1 }; // Default: newest first
    if (q !== undefined && q !== null && String(q).trim() !== '') {
      // When searching, sort by displayCode to show results in order
      // This will naturally show orders with the search term at the beginning first
      // (e.g., "3" will show "3abc", "a3bc", "ab3c", "abc3" in order)
      // When user types "a3", it will show: "a3bc", "a3cd", etc.
      sortOrder = { displayCode: 1 }; // Sort by displayCode ascending (alphabetical order)
    }
    
    // Try different databases: 'orders' database first, then 'CoffeeDB'
    // When searching, try all databases to find matching orders
    let items = [];
    let total = 0;
    
    // Try 1: 'orders' database > 'ordersList' collection
    try {
      const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
      const coll = ordersDb.collection('ordersList');
      [items, total] = await Promise.all([
        coll.find(filters).sort(sortOrder).skip(skip).limit(limit).toArray(),
        coll.countDocuments(filters)
      ]);
    } catch (err) {
      console.error("Error querying 'orders' database:", err);
    }
    
    // Try 2: Current database (CoffeeDB) > ordersList collection
    // Always try next database if no results yet (even with search query)
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
        [items, total] = await Promise.all([
          coll.find(filters).sort(sortOrder).skip(skip).limit(limit).toArray(),
          coll.countDocuments(filters)
        ]);
      } catch (err) {
        console.error("Error querying current database ordersList:", err);
      }
    }

    // Fallback to default Order model collection
    // Always try fallback if no results yet (even with search query)
    if (total === 0) {
      try {
        [items, total] = await Promise.all([
          Order.find(filters).sort(sortOrder).skip(skip).limit(limit).lean(),
          Order.countDocuments(filters)
        ]);
      } catch (err) {
        console.error("Error querying default Order model:", err);
      }
    }

    const transformed = items.map(o => ({
      _id: o._id ? String(o._id) : undefined,
      // IMPORTANT: Use o.id (order ID like "ORD-2025-0093") first, fallback to _id only if id doesn't exist
      id: String(o.id || o._id || ''),
      displayCode: (o.displayCode && typeof o.displayCode === 'string' && o.displayCode.trim().length > 0) ? String(o.displayCode).trim() : null, // 4-character alphanumeric code for display
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      total: o.total,
      subtotal: o.subtotal,
      discount: o.discount,
      pointsUsed: o.pointsUsed || 0,
      pointsEarned: o.pointsEarned || 0,
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
// POST /api/orders - tạo đơn hàng mới từ trang checkout
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const rawItems = Array.isArray(body.items) ? body.items : [];
    // Chuẩn hóa items: luôn có qty & quantity
    const items = rawItems.map((it) => {
      const qty = Number(it.qty ?? it.quantity ?? 1);
      return {
        productId: it.productId,
        name: it.name,
        sku: it.sku,
        price: Number(it.price) || 0,
        qty,
        quantity: qty,
      };
    });

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items required',
      });
    }

    // Tính subtotal từ items
    const subtotal = items.reduce((sum, it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity || it.qty || 1);
      return sum + price * qty;
    }, 0);

    // Phí ship: ưu tiên FE gửi, không có thì auto
    const shippingFee =
      body.shippingFee != null
        ? Number(body.shippingFee)
        : subtotal > 300000
        ? 0
        : 30000;

    const discount = Number(body.discount) || 0;
    const total = subtotal + shippingFee - discount;

    const now = new Date();
    const year = now.getFullYear();

    // Lấy số thứ tự theo năm: ORD-YYYY-0001
    let seq = 1;
    try {
      const last = await Order.find({ id: new RegExp(`^ORD-${year}-`) })
        .sort({ createdAt: -1 })
        .limit(1);

      if (last[0] && last[0].id) {
        const m = String(last[0].id).match(/ORD-\d{4}-(\d+)/);
        if (m) seq = parseInt(m[1], 10) + 1;
      }
    } catch (e) {
      console.error('Find last order error:', e);
    }

    const seqStr = String(seq).padStart(4, '0');
    const id = `ORD-${year}-${seqStr}`;

    // Mã ngắn hiển thị #xxxx
    const displayCode =
      body.displayCode ||
      Math.random().toString(16).slice(2, 6).toLowerCase();

    // Lấy email từ body hoặc từ user đăng nhập
    const customerEmail =
      body.customerEmail ||
      (req.user && (req.user.email || req.user.username)) ||
      null;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'customerEmail is required',
      });
    }

    const customerId =
      body.customerId ||
      (req.user && (req.user.id || req.user._id)) ||
      undefined;

    // Trạng thái order/payout theo schema
    const VALID_STATUS = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ];
    const VALID_PAYMENT_STATUS = ['pending', 'paid', 'failed', 'refunded'];

    const status = VALID_STATUS.includes(body.status)
      ? body.status
      : 'pending';

    const paymentStatus = VALID_PAYMENT_STATUS.includes(body.paymentStatus)
      ? body.paymentStatus
      : 'pending';

    const orderDoc = {
      id,
      displayCode,
      items,
      customerEmail,
      customerId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      subtotal,
      shippingFee,
      discount,
      tax: body.tax || 0,
      total,
      currency: body.currency || 'VND',
      notes: body.note,
      paymentMethod: body.paymentMethod || 'cod',
      paymentStatus,
      status,
      shippingActivity: body.shippingActivity || [],
      // createdAt / updatedAt để Mongoose tự set (timestamps)
    };

    // 👉 dùng model Order nên chắc chắn đúng DB + collection
    const order = await Order.create(orderDoc);

    const transformed = {
      _id: String(order._id),
      id: order.id,
      displayCode: order.displayCode || null,
      customerEmail: order.customerEmail,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingActivity: order.shippingActivity,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return res.status(201).json({ success: true, data: transformed });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: err.message,
    });
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
      displayCode: o.displayCode || null, // Random 4-character hex code for display
      customerEmail: o.customerEmail,
      customerId: o.customerId,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      items: o.items || [],
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discount: o.discount,
      pointsUsed: o.pointsUsed || 0,
      pointsEarned: o.pointsEarned || 0,
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

// Helper function to update customer loyalty points when order is delivered
async function updateCustomerLoyaltyPoints(order) {
  try {
    if (!order || order.status !== 'delivered') return;
    
    const customerEmail = order.customerEmail?.toLowerCase()?.trim();
    if (!customerEmail) return;
    
    // Find customer by email
    let customer = null;
    
    // Try to find in customers database
    try {
      const customersDb = mongoose.connection.useDb('customers', { useCache: true });
      const customersColl = customersDb.collection('customersList');
      customer = await customersColl.findOne({ email: customerEmail });
    } catch (err) {
      console.error('Error finding customer in customers DB:', err);
    }
    
    // Try current database
    if (!customer) {
      try {
        const customersColl = mongoose.connection.db.collection('customersList');
        customer = await customersColl.findOne({ email: customerEmail });
      } catch (err) {
        console.error('Error finding customer in current DB:', err);
      }
    }
    
    // Try Customer model
    if (!customer) {
      try {
        customer = await Customer.findOne({ email: customerEmail }).lean();
      } catch (err) {
        console.error('Error finding customer in Customer model:', err);
      }
    }
    
    if (!customer) {
      console.warn(`Customer not found for email: ${customerEmail}`);
      return;
    }
    
    // Calculate points earned (10% of orderTotal BEFORE discount)
    const orderTotal = order.subtotal + (order.shippingFee || 0);
    const pointsEarned = calculatePointsEarned(orderTotal);
    
    if (pointsEarned <= 0) return;
    
    // Update customer loyalty points
    const customerId = customer._id || customer.id;
    const currentPoints = customer.loyalty?.currentPoints || customer.loyalty?.points || 0;
    const totalEarned = (customer.loyalty?.totalEarned || 0) + pointsEarned;
    const newPoints = currentPoints + pointsEarned;
    
    // Add to history
    const historyEntry = {
      orderId: order.id || order._id?.toString(),
      orderDate: order.createdAt || new Date(),
      type: 'earned',
      points: pointsEarned,
      description: `Earned ${pointsEarned} points from order ${order.id}`,
      createdAt: new Date()
    };
    
    const updateData = {
      'loyalty.totalEarned': totalEarned,
      'loyalty.currentPoints': newPoints,
      'loyalty.lastAccrualAt': new Date(),
      $push: { 'loyalty.history': historyEntry }
    };
    
    // Update in same location where customer was found
    try {
      const customersDb = mongoose.connection.useDb('customers', { useCache: true });
      const customersColl = customersDb.collection('customersList');
      await customersColl.updateOne(
        { _id: Types.ObjectId.isValid(customerId) ? new Types.ObjectId(customerId) : customerId },
        { $set: updateData, $push: { 'loyalty.history': historyEntry } }
      );
    } catch (err) {
      try {
        const customersColl = mongoose.connection.db.collection('customersList');
        await customersColl.updateOne(
          { _id: Types.ObjectId.isValid(customerId) ? new Types.ObjectId(customerId) : customerId },
          { $set: updateData, $push: { 'loyalty.history': historyEntry } }
        );
      } catch (err2) {
        try {
          await Customer.findByIdAndUpdate(customerId, {
            $set: updateData,
            $push: { 'loyalty.history': historyEntry }
          });
        } catch (err3) {
          console.error('Error updating customer loyalty points:', err3);
        }
      }
    }
    
  } catch (err) {
    console.error('Error in updateCustomerLoyaltyPoints:', err);
  }
}

// PATCH /api/orders/:id - Update order status and/or shipping activity
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shippingActivity, pointsUsed } = req.body;
    
    // Get current order to check previous status
    let currentOrder = null;
    try {
      const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
      const coll = ordersDb.collection('ordersList');
      currentOrder = await coll.findOne({ id: id }) || await coll.findOne({ _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id });
    } catch (err) {
      try {
        const coll = mongoose.connection.db.collection('ordersList');
        currentOrder = await coll.findOne({ id: id }) || await coll.findOne({ _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id });
      } catch (err2) {
        currentOrder = await Order.findOne({ id: id }) || await Order.findById(id);
      }
    }
    
    // Build update data
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (shippingActivity !== undefined) updateData.shippingActivity = shippingActivity;
    if (pointsUsed !== undefined) {
      updateData.pointsUsed = Math.max(0, parseInt(pointsUsed, 10) || 0);
      // Calculate discount from points used (1 point = 1,000 VND)
      updateData.discount = calculateDiscountFromPoints(updateData.pointsUsed);
      
      // Recalculate total if discount changed
      if (currentOrder) {
        const subtotal = currentOrder.subtotal || 0;
        const shippingFee = currentOrder.shippingFee || 0;
        updateData.total = Math.max(0, subtotal + shippingFee - updateData.discount);
      }
    }
    
    // Calculate points earned when order is delivered
    if (status === 'delivered' && currentOrder) {
      const orderTotal = (currentOrder.subtotal || 0) + (currentOrder.shippingFee || 0);
      updateData.pointsEarned = calculatePointsEarned(orderTotal);
    }
    
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
    
    // If order status changed to 'delivered', update customer loyalty points
    if (status === 'delivered' && currentOrder && currentOrder.status !== 'delivered') {
      // Get updated order
      let updatedOrder = null;
      try {
        const ordersDb = mongoose.connection.useDb('orders', { useCache: true });
        const coll = ordersDb.collection('ordersList');
        updatedOrder = await coll.findOne({ id: id }) || await coll.findOne({ _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id });
      } catch (err) {
        try {
          const coll = mongoose.connection.db.collection('ordersList');
          updatedOrder = await coll.findOne({ id: id }) || await coll.findOne({ _id: Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id });
        } catch (err2) {
          updatedOrder = await Order.findOne({ id: id }) || await Order.findById(id);
        }
      }
      
      if (updatedOrder) {
        await updateCustomerLoyaltyPoints(updatedOrder);
      }
    }
    
    // If points were used, deduct from customer
    if (pointsUsed !== undefined && pointsUsed > 0 && currentOrder) {
      const customerEmail = currentOrder.customerEmail?.toLowerCase()?.trim();
      if (customerEmail) {
        try {
          // Find customer
          let customer = null;
          try {
            const customersDb = mongoose.connection.useDb('customers', { useCache: true });
            const customersColl = customersDb.collection('customersList');
            customer = await customersColl.findOne({ email: customerEmail });
          } catch (err) {
            const customersColl = mongoose.connection.db.collection('customersList');
            customer = await customersColl.findOne({ email: customerEmail });
          }
          
          if (!customer) {
            customer = await Customer.findOne({ email: customerEmail }).lean();
          }
          
          if (customer) {
            const customerId = customer._id || customer.id;
            const currentPoints = customer.loyalty?.currentPoints || customer.loyalty?.points || 0;
            const newPoints = Math.max(0, currentPoints - pointsUsed);
            
            // Add to history
            const historyEntry = {
              orderId: currentOrder.id || currentOrder._id?.toString(),
              orderDate: currentOrder.createdAt || new Date(),
              type: 'used',
              points: pointsUsed,
              description: `Used ${pointsUsed} points for order ${currentOrder.id}`,
              createdAt: new Date()
            };
            
            try {
              const customersDb = mongoose.connection.useDb('customers', { useCache: true });
              const customersColl = customersDb.collection('customersList');
              await customersColl.updateOne(
                { _id: Types.ObjectId.isValid(customerId) ? new Types.ObjectId(customerId) : customerId },
                { 
                  $set: { 'loyalty.currentPoints': newPoints },
                  $push: { 'loyalty.history': historyEntry }
                }
              );
            } catch (err) {
              try {
                const customersColl = mongoose.connection.db.collection('customersList');
                await customersColl.updateOne(
                  { _id: Types.ObjectId.isValid(customerId) ? new Types.ObjectId(customerId) : customerId },
                  { 
                    $set: { 'loyalty.currentPoints': newPoints },
                    $push: { 'loyalty.history': historyEntry }
                  }
                );
              } catch (err2) {
                await Customer.findByIdAndUpdate(customerId, {
                  $set: { 'loyalty.currentPoints': newPoints },
                  $push: { 'loyalty.history': historyEntry }
                });
              }
            }
            
          }
        } catch (err) {
          console.error('Error deducting points from customer:', err);
        }
      }
    }
    
    res.json({ success: true, message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
  }
});

module.exports = router;



