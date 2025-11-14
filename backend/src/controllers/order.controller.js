const Order = require('../models/Order');
const Product = require('../models/Product');

exports.create = async (req,res) => {
  const { items, address } = req.body; // items: [{ productId, qty }]
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message:'No items' });

  const dbItems = await Promise.all(items.map(async it => {
    const p = await Product.findById(it.productId);
    if (!p) throw new Error('Product not found');
    return { product:p._id, name:p.name, price:p.price, qty:it.qty||1 };
  }));
  const total = dbItems.reduce((s,i)=>s+i.price*i.qty,0);
  const order = await Order.create({ user:req.userId, items:dbItems, total, address });
  res.json({ order });
};

exports.myOrders = async (req,res) => {
  const orders = await Order.find({ user:req.userId }).sort({ createdAt:-1 });
  res.json({ items: orders });
};
