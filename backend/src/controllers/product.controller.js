const Product = require('../models/Product');

async function listProducts(req, res) {
  const { page = 1, limit = 12, category } = req.query; // <- 12 thay vì 3
  const q = category ? { category } : {};
  const items = await Product.find(q)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Product.countDocuments(q);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total/limit) });
}

async function index(req, res) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '12', 10)));
  const { category } = req.query;

  const filter = {};
  if (category && ['roasted', 'sets', 'cups', 'makers'].includes(category)) {
    filter.category = category;
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

async function show(req, res) {
  const item = await Product.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Product not found' });
  res.json(item);
}

module.exports = { index, show };
