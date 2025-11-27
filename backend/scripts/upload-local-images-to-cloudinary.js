/**
 * Upload product images from local folder to Cloudinary
 * and update backend/docs/productsList.json with new URLs.
 *
 * Strategy:
 * 1. Load products list
 * 2. Load local images from frontend/public/images (png/jpg/jpeg/webp)
 * 3. Try to match image file to product name via slug comparison
 * 4. Upload matched image to Cloudinary (folder: products)
 * 5. Update product imageUrl and save file
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const productsFilePath = path.join(__dirname, '../docs/productsList.json');
const imagesDir = path.join(__dirname, '../../frontend/public/images');
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

// Helpers
const slugify = (str) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const loadProducts = () => JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));

const loadImages = () => {
  if (!fs.existsSync(imagesDir)) {
    throw new Error(`Images directory not found: ${imagesDir}`);
  }
  const files = fs
    .readdirSync(imagesDir)
    .filter((file) => allowedExtensions.includes(path.extname(file).toLowerCase()));

  if (files.length === 0) {
    throw new Error(`No image files found in ${imagesDir}`);
  }

  return files.map((file) => ({
    file,
    slug: slugify(path.basename(file, path.extname(file))),
    fullPath: path.join(imagesDir, file),
    used: false,
  }));
};

const findBestImageMatch = (productSlug, imagePool) => {
  // Try exact slug inclusion match first
  let match =
    imagePool.find((img) => !img.used && productSlug && img.slug.includes(productSlug)) || null;

  if (match) {
    match.used = true;
    return match;
  }

  // Try partial match using significant words
  const words = productSlug.split('-').filter((word) => word.length > 2);
  if (words.length) {
    match =
      imagePool.find(
        (img) => !img.used && words.some((word) => img.slug.includes(word)),
      ) || null;
    if (match) {
      match.used = true;
      return match;
    }
  }

  // Fallback: use first unused image
  match = imagePool.find((img) => !img.used);
  if (match) {
    match.used = true;
    return match;
  }

  // If all used, reuse first image (rare case)
  return imagePool[0];
};

const uploadImage = (filePath, product, index) => {
  return new Promise((resolve, reject) => {
    const publicId = `products/local-product-${product.id || index}-${slugify(product.name).slice(
      0,
      40,
    )}`;

    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'products',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );
  });
};

const run = async () => {
  const products = loadProducts();
  const images = loadImages();

  console.log(`📷 Found ${images.length} local images`);
  console.log(`🛍️  Products to process: ${products.length}`);

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productSlug = slugify(product.name);
    const imageMatch = findBestImageMatch(productSlug, images);

    console.log(
      `\n[${i + 1}/${products.length}] ${product.name} -> ${imageMatch ? imageMatch.file : 'N/A'}`,
    );

    if (!imageMatch) {
      console.warn('  ⚠️  No image available, skipping upload');
      results.push({ productId: product.id, status: 'skipped', reason: 'No image available' });
      continue;
    }

    try {
      const url = await uploadImage(imageMatch.fullPath, product, i + 1);
      product.imageUrl = url;
      product.updatedAt = new Date().toISOString();
      results.push({ productId: product.id, status: 'success', image: imageMatch.file, url });
      console.log('  ✅ Uploaded:', url);
    } catch (error) {
      console.error('  ❌ Upload error:', error.message);
      results.push({
        productId: product.id,
        status: 'error',
        image: imageMatch.file,
        error: error.message,
      });
    }

    // Small delay to avoid hitting API limits
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  // Save updated products file
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`\n📝 Updated products saved to ${productsFilePath}`);

  // Save log
  const logPath = path.join(__dirname, '../docs/upload-local-log.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`📋 Detailed log written to ${logPath}`);

  // Summary
  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;

  console.log('\n📊 Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  ⏭️  Skipped: ${skippedCount}`);
};

run()
  .then(() => {
    console.log('\n🎉 Completed uploading local images to Cloudinary');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });








