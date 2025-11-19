const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Lấy danh sách tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      stock,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (stock !== undefined) {
      query.stock = stock === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Try different databases: 'products' database first, then 'CoffeeDB'
    let products = [];
    let total = 0;
    
    // Try 1: 'products' database > 'productsList' collection
    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});
      if (totalCount > 0) {
        [products, total] = await Promise.all([
          coll.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).toArray(),
          coll.countDocuments(query)
        ]);
        if (total === 0 && totalCount > 0) {
          [products, total] = await Promise.all([
            coll.find({}).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).toArray(),
            coll.countDocuments({})
          ]);
        }
      }
    } catch (err) {
    }
    
    // Try 2: Current database (CoffeeDB) > productsList collection
    if (total === 0) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});
        if (totalCount > 0) {
          [products, total] = await Promise.all([
            coll.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).toArray(),
            coll.countDocuments(query)
          ]);
          if (total === 0 && totalCount > 0) {
            [products, total] = await Promise.all([
              coll.find({}).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).toArray(),
              coll.countDocuments({})
            ]);
          }
        }
      } catch (err) {
      }
    }

    // Fallback to default Product model collection
    if (total === 0) {
      try {
        [products, total] = await Promise.all([
          Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
          Product.countDocuments(query)
        ]);
      } catch (err) {
      }
    }

    // Transform data to match frontend format
    const transformedProducts = products.map(product => ({
      id: product.id || product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      status: product.status
    }));

    res.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET /api/products/:id - Lấy chi tiết một sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;
    
    // Try collections in order: productsList, products.productsList, then products
    const { Types } = mongoose;
    
    // Try 1: productsList (direct query)
    try {
      const coll = mongoose.connection.db.collection('productsList');
      // Try by numeric id first
      if (!isNaN(id)) {
        product = await coll.findOne({ id: parseInt(id) });
      }
      // Try by ObjectId
      if (!product && Types.ObjectId.isValid(id)) {
        product = await coll.findOne({ _id: new Types.ObjectId(id) });
      }
      // Try by string id
      if (!product) {
        product = await coll.findOne({ id: String(id) });
      }
      } catch (err) {
      }
    
    // Try 2: products.productsList
    if (!product) {
      try {
        const coll = mongoose.connection.db.collection('products.productsList');
        if (!isNaN(id)) {
          product = await coll.findOne({ id: parseInt(id) });
        }
        if (!product && Types.ObjectId.isValid(id)) {
          product = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!product) {
          product = await coll.findOne({ id: String(id) });
        }
      } catch (err) {
      }
    }
    
    // Try 3: products
    if (!product) {
      try {
        const coll = mongoose.connection.db.collection('products');
        if (!isNaN(id)) {
          product = await coll.findOne({ id: parseInt(id) });
        }
        if (!product && Types.ObjectId.isValid(id)) {
          product = await coll.findOne({ _id: new Types.ObjectId(id) });
        }
        if (!product) {
          product = await coll.findOne({ id: String(id) });
        }
      } catch (err) {
      }
    }
    
    // Fallback to default Product model collection
    if (!product) {
      // Try to find by id field first, then by _id
      if (!isNaN(id)) {
        product = await Product.findOne({ id: parseInt(id) });
      }
      if (!product && mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      }
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const transformedProduct = {
      id: product.id || product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      status: product.status
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// POST /api/products - Tạo sản phẩm mới trong MongoDB
router.post('/', async (req, res) => {
  try {
    // Get the highest id to generate new id
    const lastProduct = await Product.findOne().sort({ id: -1 }).lean();
    const newId = lastProduct ? (lastProduct.id || 0) + 1 : 1;
    
    // Build product data
    const productData = {
      id: newId,
      name: req.body.name,
      imageUrl: req.body.imageUrl || '',
      description: req.body.description || '',
      category: req.body.category,
      stock: req.body.stock !== undefined ? req.body.stock : true,
      sku: req.body.sku,
      price: Number(req.body.price) || 0,
      quantity: Number(req.body.quantity) || 0,
      status: req.body.status || 'Publish',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validate required fields
    if (!productData.name || !productData.category || !productData.sku) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, and sku are required'
      });
    }
    
    // Create product in MongoDB
    const product = await Product.create(productData);
    
    // Transform response to match frontend format
    const transformedProduct = {
      id: product.id || product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: transformedProduct
    });
  } catch (error) {
    // Handle duplicate key error (e.g., duplicate SKU or id)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field}: ${error.keyValue[field]} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Cập nhật thông tin sản phẩm trong MongoDB
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Allowed fields that can be updated
    const allowed = [
      'name',
      'imageUrl',
      'images',
      'thumbnail',
      'imageAltText',
      'description',
      'category',
      'stock',
      'sku',
      'price',
      'quantity',
      'status'
    ];
    
    // Build update data object with only allowed fields
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }
    
    // Add updatedAt timestamp
    data.updatedAt = new Date();

    // Build safe filter: try numeric id, else valid ObjectId, else respond 400
    const filters = [];
    const nId = Number(id);
    if (!Number.isNaN(nId)) filters.push({ id: nId });
    const { Types } = require('mongoose');
    if (Types.ObjectId.isValid(id)) filters.push({ _id: id });
    if (filters.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    // Update product in MongoDB
    const product = await Product.findOneAndUpdate(
      { $or: filters },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Transform response to match frontend format
    const transformedProduct = {
      id: product.id || product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      description: product.description,
      category: product.category,
      stock: product.stock,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      status: product.status,
      updatedAt: product.updatedAt
    };

    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      data: transformedProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating product', 
      error: error.message 
    });
  }
});

module.exports = router;

