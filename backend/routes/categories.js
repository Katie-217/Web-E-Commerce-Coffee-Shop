const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();

const CATEGORY_PIPELINE = [
  {
    $group: {
      _id: {
        $cond: [
          { $or: [{ $eq: ['$category', null] }, { $eq: ['$category', ''] }] },
          'Uncategorized',
          '$category',
        ],
      },
      count: { $sum: 1 },
      inactiveCount: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ['$status', 'Inactive'] },
                { $eq: ['$status', 'inactive'] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
  { $sort: { count: -1 } },
];

const addCategoriesToMap = (map, results) => {
  results.forEach((item) => {
    const name = item.name || item._id || 'Uncategorized';
    const count = item.count || item.productCount || 0;
    const status = item.status || (item.inactiveCount === item.count ? 'Inactive' : 'Active');
    const key = name.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name,
        productCount: count,
        status,
      });
    } else {
      map.get(key).productCount += count;
      if (status === 'Inactive') {
        map.get(key).status = 'Inactive';
      }
    }
  });
};

const aggregateFromCollection = async (collection, label) => {
  try {
    const cursor = collection.aggregate(CATEGORY_PIPELINE);
    const results = await cursor.toArray();
    console.log(`📊 Categories from ${label}:`, results.length);
    return results.map((item) => ({
      name: item._id,
      count: item.count,
    }));
  } catch (error) {
    console.log(`❌ Failed to aggregate categories from ${label}:`, error.message);
    return [];
  }
};

const aggregateFromModel = async () => {
  try {
    const results = await Product.aggregate(CATEGORY_PIPELINE);
    console.log(`📊 Categories from Product model:`, results.length);
    return results.map((item) => ({
      name: item._id,
      count: item.count,
    }));
  } catch (error) {
    console.log('❌ Failed to aggregate categories from Product model:', error.message);
    return [];
  }
};

router.get('/', async (req, res) => {
  try {
    const categoriesMap = new Map();

    // Try 'products' DB > productsList
    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});
      if (totalCount > 0) {
        const results = await aggregateFromCollection(coll, 'products.productsList');
        addCategoriesToMap(categoriesMap, results);
      }
    } catch (error) {
      console.log('❌ Unable to access products.productsList for categories:', error.message);
    }

    // Try default DB > productsList
    if (categoriesMap.size === 0) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});
        if (totalCount > 0) {
          const results = await aggregateFromCollection(coll, 'productsList');
          addCategoriesToMap(categoriesMap, results);
        }
      } catch (error) {
        console.log('❌ Unable to access productsList for categories:', error.message);
      }
    }

    // Fallback to Product model collection
    if (categoriesMap.size === 0) {
      const results = await aggregateFromModel();
      addCategoriesToMap(categoriesMap, results);
    }

    const categories = Array.from(categoriesMap.values()).map((item, index) => ({
      id: index + 1,
      name: item.name,
      productCount: item.productCount,
      status: item.status,
    }));

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
});

const buildCategoryFilter = (name) => {
  if (!name || name.toLowerCase() === 'uncategorized') {
    return {
      $or: [{ category: { $exists: false } }, { category: '' }, { category: null }],
    };
  }
  return { category: name };
};

const updateManyProducts = async (collection, filter, update, label) => {
  try {
    const result = await collection.updateMany(filter, { $set: update });
    if (result.modifiedCount) {
      console.log(`✅ Updated ${result.modifiedCount} products in ${label}`);
    }
    return result.modifiedCount;
  } catch (error) {
    console.log(`❌ Failed to update in ${label}:`, error.message);
    return 0;
  }
};

const deleteManyProducts = async (collection, filter, label) => {
  try {
    const result = await collection.deleteMany(filter);
    if (result.deletedCount) {
      console.log(`🗑️ Deleted ${result.deletedCount} products in ${label}`);
    }
    return result.deletedCount || 0;
  } catch (error) {
    console.log(`❌ Failed to delete in ${label}:`, error.message);
    return 0;
  }
};

router.patch('/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { title, status } = req.body || {};

    if (!title && !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing fields to update',
      });
    }

    const filter = buildCategoryFilter(categoryName);
    const updateFields = {};
    if (title) {
      updateFields.category = title.trim();
    }
    if (status) {
      updateFields.status = status === 'Inactive' ? 'Inactive' : 'Publish';
    }

    if (!Object.keys(updateFields).length) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    let modifiedCount = 0;

    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});
      if (totalCount > 0) {
        modifiedCount += await updateManyProducts(coll, filter, updateFields, 'products.productsList');
      }
    } catch (error) {
      console.log('❌ Unable to access products.productsList for update:', error.message);
    }

    if (modifiedCount === 0) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});
        if (totalCount > 0) {
          modifiedCount += await updateManyProducts(coll, filter, updateFields, 'productsList');
        }
      } catch (error) {
        console.log('❌ Unable to access productsList for update:', error.message);
      }
    }

    if (modifiedCount === 0) {
      try {
        const result = await Product.updateMany(filter, { $set: updateFields });
        modifiedCount += result.modifiedCount || 0;
      } catch (error) {
        console.log('❌ Failed to update in Product model:', error.message);
      }
    }

    if (modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        updatedCount: modifiedCount,
      },
    });
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message,
    });
  }
});

router.delete('/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const filter = buildCategoryFilter(categoryName);
    let deletedCount = 0;

    try {
      const productsDb = mongoose.connection.useDb('products', { useCache: true });
      const coll = productsDb.collection('productsList');
      const totalCount = await coll.countDocuments({});
      if (totalCount > 0) {
        deletedCount += await deleteManyProducts(coll, filter, 'products.productsList');
      }
    } catch (error) {
      console.log('❌ Unable to access products.productsList for delete:', error.message);
    }

    if (deletedCount === 0) {
      try {
        const coll = mongoose.connection.db.collection('productsList');
        const totalCount = await coll.countDocuments({});
        if (totalCount > 0) {
          deletedCount += await deleteManyProducts(coll, filter, 'productsList');
        }
      } catch (error) {
        console.log('❌ Unable to access productsList for delete:', error.message);
      }
    }

    if (deletedCount === 0) {
      try {
        const result = await Product.deleteMany(filter);
        deletedCount += result.deletedCount || 0;
      } catch (error) {
        console.log('❌ Failed to delete in Product model:', error.message);
      }
    }

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: `Deleted ${deletedCount} products in category`,
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
});

module.exports = router;


