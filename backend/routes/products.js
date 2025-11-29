const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');

// GET /api/products - Lấy danh sách tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    // ====== PAGINATION ======
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // ====== FILTER CƠ BẢN ======
    const {
      search,
      category,
      inStock,
      status,
      minPrice,
      maxPrice,
      sortBy,
    } = req.query;

    const query = {};

    // Tìm theo tên / mô tả
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { description: regex }];
    }

    if (category) {
      query.category = category;
    }

    // filter trạng thái
    if (status) {
      query.status = status;
    }

    // filter còn hàng / hết hàng
    if (inStock === 'true') {
      query.$or = [
        { inStock: true },
        { stock: { $gt: 0 } },
        { countInStock: { $gt: 0 } },
      ];
    } else if (inStock === 'false') {
      query.$or = [
        { inStock: false },
        { stock: { $lte: 0 } },
        { countInStock: { $lte: 0 } },
      ];
    }

    // filter giá
    if (minPrice) {
      query.price = { ...(query.price || {}), $gte: Number(minPrice) };
    }
    if (maxPrice) {
      query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
    }

    // ====== SORT CƠ BẢN (GIÁ, MỚI NHẤT) ======
    const sortOption = {};
    switch (sortBy) {
      case 'priceAsc':
        sortOption.price = 1;
        break;
      case 'priceDesc':
        sortOption.price = -1;
        break;
      case 'new':
        sortOption.createdAt = -1;
        break;
      // 'best' sẽ sort ở FE theo soldCount, nên tạm giữ nguyên
      default:
        // sort mặc định theo createdAt mới nhất
        sortOption.createdAt = -1;
        break;
    }

    const [products, totalProducts, soldStats] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
      // TÍNH TỔNG ĐÃ BÁN TỪ ORDER
        Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        // Dùng productId đúng với schema Order
        _id: '$items.productId',
        // quantity là field chính, còn nếu dữ liệu cũ dùng qty thì fallback
        soldCount: {
          $sum: {
            $ifNull: ['$items.quantity', '$items.qty'],
          },
        },
      },
    },
  ]),

    ]);

    // soldStats = [{ _id: ObjectId, soldCount: Number }, ...]
    // soldStats = [{ _id: productId, soldCount: Number }, ...]
const soldMap = new Map(
  soldStats.map((doc) => [String(doc._id), Number(doc.soldCount) || 0])
);

const productsWithSold = products.map((p) => {
  const obj = p.toObject();

  // product có thể có cả id (số) lẫn _id (ObjectId)
  const keyByNumericId = obj.id != null ? String(obj.id) : null;
  const keyByObjectId = obj._id != null ? String(obj._id) : null;

  obj.soldCount =
    (keyByNumericId && soldMap.get(keyByNumericId)) ??
    (keyByObjectId && soldMap.get(keyByObjectId)) ??
    0;

  return obj;
});


    return res.json({
      success: true,
      data: productsWithSold,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
});

// GET /api/products/:id - Lấy chi tiết một sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      '🔍 GET /api/products/:id - Searching for product with ID:',
      id,
      'Type:',
      typeof id,
    );
    let product = null;

    const { Types } = mongoose;

    // Build filters: thử theo id number, _id, string id
    const filters = [];
    const nId = Number(id);
    if (!Number.isNaN(nId)) filters.push({ id: nId });
    if (Types.ObjectId.isValid(id)) {
      filters.push({ _id: new Types.ObjectId(id) });
    }
    filters.push({ id: String(id) }); // thêm string id luôn

    // Helper function to try finding product in a collection
    const tryFindInCollection = async (coll, collectionName) => {
      try {
        for (const filter of filters) {
          const found = await coll.findOne(filter);
          if (found) {
            product = found;
            console.log(`✅ Found in ${collectionName} with filter:`, filter);
            return true;
          }
        }

        // Debug sample
        const sample = await coll.find({}).limit(3).toArray();
        if (sample.length > 0) {
          console.log(
            `📋 Sample IDs in ${collectionName}:`,
            sample.map((p) => ({ id: p.id, _id: p._id, name: p.name })),
          );
        }
      } catch (err) {
        console.log(`❌ Error searching in ${collectionName}:`, err.message);
      }
      return false;
    };

    // Try 1: 'products' database > 'productsList' collection
    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});
      console.log(`📊 products.productsList collection has ${totalCount} documents`);

      if (totalCount > 0) {
        await tryFindInCollection(coll, 'products.productsList');
      }
    } catch (err) {
      console.log('❌ Failed to access products.productsList:', err.message);
    }

    // Try 2: Current database (CoffeeDB) > productsList collection
    if (!product) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});
        console.log(`📊 productsList collection has ${totalCount} documents`);

        if (totalCount > 0) {
          await tryFindInCollection(coll, 'productsList');
        }
      } catch (err) {
        console.log('❌ Failed to access productsList:', err.message);
      }
    }

    // Try 3: current DB > products collection
    if (!product) {
      try {
        const coll = mongoose.connection.db.collection('products');
        const totalCount = await coll.countDocuments({});
        console.log(`📊 products collection has ${totalCount} documents`);

        if (totalCount > 0) {
          await tryFindInCollection(coll, 'products');
        }
      } catch (err) {
        console.log('❌ Failed to access products:', err.message);
      }
    }

    // Fallback: default Product model collection (mongoose)
    if (!product) {
      try {
        console.log('📊 Trying default Product model collection...');
        if (filters.length > 0) {
          product = await Product.findOne({ $or: filters }).lean();
          if (product) {
            console.log('✅ Found in default collection with $or filters');
          }
        }
      } catch (err) {
        console.log('❌ Failed to search in default collection:', err.message);
      }
    }

    if (!product) {
      console.log('❌ Product not found in any collection with ID:', id);
      console.log('💡 Tried searching with:', {
        numeric: !Number.isNaN(nId) ? nId : 'N/A',
        objectId: Types.ObjectId.isValid(id) ? id : 'N/A',
        string: String(id),
      });
      return res.status(404).json({
        success: false,
        message: 'Product not found',
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
      variants: product.variants || [],
    };

    console.log(
      '✅ Product found and transformed. ID:',
      transformedProduct.id,
      'Name:',
      transformedProduct.name,
    );

    res.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    let productIdNum = Number(id);

    // Nếu FE truyền _id (Mongo) thì convert sang id number trong Product
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

    const reviews = await Review.find({ productId: productIdNum })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
    });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    let productIdNum = Number(id);

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

    const { rating, comment, customerName, customerEmail, title } = req.body;

    // ⭐ chỉ check rating nếu FE gửi lên
    if (rating != null) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required',
      });
    }

    if (
      !customerName ||
      !customerName.trim() ||
      !customerEmail ||
      !customerEmail.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'customerName and customerEmail are required',
      });
    }

    // Gom data, chỉ gán rating nếu có
    const reviewData = {
      productId: productIdNum,
      comment: comment.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      title: (title || '').trim(),
    };

    if (rating != null) {
      reviewData.rating = rating;
    }

    const review = await Review.create(reviewData);

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

// POST /api/products - Tạo sản phẩm mới trong MongoDB / collections liên quan
router.post('/', async (req, res) => {
  try {
    console.log('🆕 POST /api/products - Creating new product');
    console.log('📦 Request body:', req.body);

    // Build product data (chưa set id, sẽ gán sau)
    const productData = {
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
      updatedAt: new Date(),
    };

    // Validate required fields
    if (!productData.name || !productData.category || !productData.sku) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, and sku are required',
      });
    }

    let savedProduct = null;
    let savedToCollection = null;

    // Try 1: 'products' database > 'productsList' collection
    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});

      if (totalCount > 0) {
        const lastProduct = await coll.findOne({}, { sort: { id: -1 } });
        const newId = lastProduct ? (lastProduct.id || 0) + 1 : 1;
        productData.id = newId;

        await coll.insertOne(productData);
        savedProduct = productData;
        savedToCollection = 'products.productsList';
        console.log('✅ Product saved to products.productsList collection');
      }
    } catch (err) {
      console.log('Failed to save to products.productsList:', err.message);
    }

    // Try 2: Current database (CoffeeDB) > productsList collection
    if (!savedProduct) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});

        if (totalCount > 0) {
          const lastProduct = await coll.findOne({}, { sort: { id: -1 } });
          const newId = lastProduct ? (lastProduct.id || 0) + 1 : 1;
          productData.id = newId;

          await coll.insertOne(productData);
          savedProduct = productData;
          savedToCollection = 'productsList';
          console.log('✅ Product saved to productsList collection');
        }
      } catch (err) {
        console.log('Failed to save to productsList:', err.message);
      }
    }

    // Fallback: Use Product model (default collection)
    if (!savedProduct) {
      try {
        const lastProduct = await Product.findOne().sort({ id: -1 }).lean();
        const newId = lastProduct ? (lastProduct.id || 0) + 1 : 1;
        productData.id = newId;

        const product = await Product.create(productData);
        savedProduct = product.toObject ? product.toObject() : product;
        savedToCollection = 'products (default)';
        console.log('✅ Product saved to default products collection');
      } catch (err) {
        console.log('Failed to save to default collection:', err.message);
        throw err;
      }
    }

    const transformedProduct = {
      id: savedProduct.id || savedProduct._id,
      name: savedProduct.name,
      imageUrl: savedProduct.imageUrl,
      description: savedProduct.description,
      category: savedProduct.category,
      stock: savedProduct.stock,
      sku: savedProduct.sku,
      price: savedProduct.price,
      quantity: savedProduct.quantity,
      status: savedProduct.status,
      variants: savedProduct.variants || [],
      createdAt: savedProduct.createdAt,
      updatedAt: savedProduct.updatedAt,
    };

    console.log('✅ Product created successfully in:', savedToCollection);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: transformedProduct,
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field}: ${error.keyValue[field]} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
});

// PUT /api/products/:id - Cập nhật thông tin sản phẩm trong MongoDB / collections liên quan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 PUT /api/products/${id} - Updating product`);
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
      'variants',
    ];

    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    data.updatedAt = new Date();

    // Build filters: numeric id, ObjectId, string id
    const filters = [];
    const nId = Number(id);
    if (!Number.isNaN(nId)) filters.push({ id: nId });
    const { Types } = mongoose;
    if (Types.ObjectId.isValid(id)) {
      filters.push({ _id: new Types.ObjectId(id) });
    }
    filters.push({ id: String(id) });

    if (filters.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    console.log('🔍 Query filters:', filters);
    console.log('📝 Update data:', data);

    let updatedProduct = null;
    let updatedInCollection = null;

    // Try 1: 'products' database > 'productsList' collection
    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});

      if (totalCount > 0) {
        for (const filter of filters) {
          const result = await coll.findOneAndUpdate(
            filter,
            { $set: data },
            { returnDocument: 'after' },
          );
          // result.value nếu là driver cũ, nhưng để đơn giản check truthy
          const doc = result && (result.value || result);
          if (doc) {
            updatedProduct = doc;
            updatedInCollection = 'products.productsList';
            console.log('✅ Product updated in products.productsList collection');
            break;
          }
        }
      }
    } catch (err) {
      console.log('Failed to update in products.productsList:', err.message);
    }

    // Try 2: Current database (CoffeeDB) > productsList collection
    if (!updatedProduct) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});

        if (totalCount > 0) {
          for (const filter of filters) {
            const result = await coll.findOneAndUpdate(
              filter,
              { $set: data },
              { returnDocument: 'after' },
            );
            const doc = result && (result.value || result);
            if (doc) {
              updatedProduct = doc;
              updatedInCollection = 'productsList';
              console.log('✅ Product updated in productsList collection');
              break;
            }
          }
        }
      } catch (err) {
        console.log('Failed to update in productsList:', err.message);
      }
    }

    // Fallback: Use Product model (default collection)
    if (!updatedProduct) {
      try {
        const product = await Product.findOneAndUpdate(
          { $or: filters },
          { $set: data },
          { new: true, runValidators: true },
        );
        if (product) {
          updatedProduct = product.toObject ? product.toObject() : product;
          updatedInCollection = 'products (default)';
          console.log('✅ Product updated in default products collection');
        }
      } catch (err) {
        console.log('Failed to update in default collection:', err.message);
      }
    }

    if (!updatedProduct) {
      console.log('❌ Product not found in any collection with ID:', id);
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    const transformedProduct = {
      id: updatedProduct.id || updatedProduct._id,
      name: updatedProduct.name,
      imageUrl: updatedProduct.imageUrl,
      description: updatedProduct.description,
      category: updatedProduct.category,
      stock: updatedProduct.stock,
      sku: updatedProduct.sku,
      price: updatedProduct.price,
      quantity: updatedProduct.quantity,
      status: updatedProduct.status,
      variants: updatedProduct.variants || [],
      updatedAt: updatedProduct.updatedAt || new Date(),
    };

    console.log('✅ Product updated successfully in:', updatedInCollection);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: transformedProduct,
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm khỏi MongoDB / collections liên quan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Types } = mongoose;
    const filters = [];
    const nId = Number(id);
    if (!Number.isNaN(nId)) filters.push({ id: nId });
    if (Types.ObjectId.isValid(id)) {
      filters.push({ _id: new Types.ObjectId(id) });
    }
    filters.push({ id: String(id) });

    const tryDelete = async (coll, collectionName) => {
      for (const filter of filters) {
        try {
          const result = await coll.findOneAndDelete(filter);
          const doc = result && (result.value || result);
          if (doc) {
            console.log(
              `✅ Deleted product from ${collectionName} with filter`,
              filter,
            );
            return doc;
          }
        } catch (err) {
          console.log(`❌ Failed to delete in ${collectionName}:`, err.message);
        }
      }
      return null;
    };

    let deletedProduct = null;
    let deletedFrom = null;

    // Try 1: 'products' database > productsList collection
    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});
      if (totalCount > 0) {
        const result = await tryDelete(coll, 'products.productsList');
        if (result) {
          deletedProduct = result;
          deletedFrom = 'products.productsList';
        }
      }
    } catch (err) {
      console.log('❌ Failed to access products.productsList:', err.message);
    }

    // Try 2: Current DB > productsList collection
    if (!deletedProduct) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});
        if (totalCount > 0) {
          const result = await tryDelete(coll, 'productsList');
          if (result) {
            deletedProduct = result;
            deletedFrom = 'productsList';
          }
        }
      } catch (err) {
        console.log('❌ Failed to access productsList:', err.message);
      }
    }

    // Fallback: default Product model collection
    if (!deletedProduct) {
      try {
        const product = await Product.findOneAndDelete({ $or: filters });
        if (product) {
          deletedProduct = product.toObject ? product.toObject() : product;
          deletedFrom = 'products (default)';
        }
      } catch (err) {
        console.log(
          '❌ Failed to delete in default Product collection:',
          err.message,
        );
      }
    }

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    console.log('🗑️ Product deleted from:', deletedFrom);
    return res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: deletedProduct.id || deletedProduct._id,
        name: deletedProduct.name,
        sku: deletedProduct.sku,
      },
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
});

module.exports = router;
