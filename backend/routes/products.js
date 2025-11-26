const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');


// GET /api/products - Lấy danh sách tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    console.log(' GET /api/products - Request received');
    console.log(' Query params:', req.query);
    
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
    
    // Get products with pagination from MongoDB
    console.log('🔍 Query:', JSON.stringify(query, null, 2));
    console.log('📊 Querying MongoDB collection: products');
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Found ${products.length} products from MongoDB`);

    // Get total count from MongoDB
    const total = await Product.countDocuments(query);
    console.log(`📊 Total products: ${total}`);

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
      status: product.status,
      variants: product.variants || []
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
    console.error('❌ Error fetching products:', error);
    console.error('❌ Error stack:', error.stack);
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
    
    // Try to find by id field first, then by _id
    let product = await Product.findOne({ id: parseInt(id) });
    if (!product) {
      product = await Product.findById(id);
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
      status: product.status,
      variants: product.variants || []
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// GET /api/products/:id/reviews
router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    let productIdNum = Number(id);

    // Nếu FE truyền _id (Mongo) thì convert sang id number trong Product
    if (Number.isNaN(productIdNum)) {
      const product = await Product.findById(id).select("id");
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      productIdNum = product.id;
    }

    const reviews = await Review.find({ productId: productIdNum })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    let productIdNum = Number(id);

    // Nếu param không phải number -> tìm theo _id để lấy field id (kiểu number)
    if (Number.isNaN(productIdNum)) {
      const product = await Product.findById(id).select('id');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      productIdNum = product.id;
    }

    // Lấy data từ body (hướng 2: bắt user nhập email + tên)
    const { rating, comment, customerName, customerEmail, title } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required',
      });
    }

    // Validate tên + email
    if (!customerName || !customerName.trim() || !customerEmail || !customerEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: 'customerName and customerEmail are required',
      });
    }

    // Tạo review trong MongoDB
    const review = await Review.create({
      productId: productIdNum,
      rating,
      comment: comment.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      title: (title || '').trim(),
    });

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message,
    });
  }
});



// POST /api/products - Tạo sản phẩm mới trong MongoDB
router.post('/', async (req, res) => {
  try {
    console.log('🆕 POST /api/products - Creating new product in MongoDB');
    console.log('📦 Request body:', req.body);
    
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
      variants: Array.isArray(req.body.variants) ? req.body.variants : [],
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
    
    console.log('📝 Product data:', productData);
    
    // Create product in MongoDB
    const product = await Product.create(productData);
    
    console.log(`✅ Product created successfully in MongoDB: ${product.id}`);
    
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
      variants: product.variants || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: transformedProduct
    });
  } catch (error) {
    console.error('❌ Error creating product in MongoDB:', error);
    console.error('❌ Error stack:', error.stack);
    
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
    console.log(`🔄 PUT /api/products/${id} - Updating product in MongoDB`);
    console.log('📦 Request body:', req.body);
    
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
      'status',
      'variants'
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
    console.log('🔍 Query filters:', filters);
    console.log('📝 Update data:', data);
    
    const product = await Product.findOneAndUpdate(
      { $or: filters },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      console.log(`❌ Product not found with id: ${id}`);
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log(`✅ Product updated successfully in MongoDB: ${product.id}`);
    
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
      variants: product.variants || [],
      updatedAt: product.updatedAt
    };

    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      data: transformedProduct 
    });
  } catch (error) {
    console.error('❌ Error updating product in MongoDB:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating product', 
      error: error.message 
    });
  }
});

module.exports = router;

