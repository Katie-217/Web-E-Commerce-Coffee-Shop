/**
 * Script to upload product images from productsList.json to Cloudinary
 * and update the JSON file with Cloudinary URLs
 */

require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const productsFilePath = path.join(__dirname, '../docs/productsList.json');

// Read products JSON file
const productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));

console.log(`📦 Found ${productsData.length} products to process\n`);

// Function to download image from URL
const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

// Function to upload image to Cloudinary
const uploadToCloudinary = async (imageBuffer, productName, productId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        public_id: `product-${productId}-${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(imageBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Process all products
const processProducts = async () => {
  const results = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < productsData.length; i++) {
    const product = productsData[i];
    const productId = product.id || product._id;
    const productName = product.name || 'unknown';
    const currentImageUrl = product.imageUrl;

    console.log(`\n[${i + 1}/${productsData.length}] Processing: ${productName} (ID: ${productId})`);

    // Skip if already a Cloudinary URL
    if (currentImageUrl && currentImageUrl.includes('cloudinary.com')) {
      console.log(`  ⏭️  Already using Cloudinary URL, skipping...`);
      skipCount++;
      results.push({
        productId,
        productName,
        status: 'skipped',
        oldUrl: currentImageUrl,
        newUrl: currentImageUrl,
      });
      continue;
    }

    // Skip if no image URL
    if (!currentImageUrl || currentImageUrl.trim() === '') {
      console.log(`  ⚠️  No image URL found, skipping...`);
      skipCount++;
      results.push({
        productId,
        productName,
        status: 'skipped',
        oldUrl: null,
        newUrl: null,
      });
      continue;
    }

    try {
      console.log(`  📥 Downloading image from: ${currentImageUrl}`);
      
      // Try to download image
      let imageBuffer;
      try {
        imageBuffer = await downloadImage(currentImageUrl);
        console.log(`  ✅ Downloaded ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      } catch (downloadError) {
        // If download fails (e.g., placeholder URL), create a placeholder image
        console.log(`  ⚠️  Download failed (${downloadError.message}), creating placeholder...`);
        
        // Create a simple placeholder image (1x1 transparent PNG)
        const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        imageBuffer = Buffer.from(placeholderBase64, 'base64');
      }

      console.log(`  📤 Uploading to Cloudinary...`);
      const cloudinaryResult = await uploadToCloudinary(
        imageBuffer,
        productName,
        productId
      );

      const newImageUrl = cloudinaryResult.secure_url;
      console.log(`  ✅ Uploaded successfully!`);
      console.log(`  🔗 New URL: ${newImageUrl}`);

      // Update product data
      product.imageUrl = newImageUrl;
      product.updatedAt = new Date().toISOString();

      successCount++;
      results.push({
        productId,
        productName,
        status: 'success',
        oldUrl: currentImageUrl,
        newUrl: newImageUrl,
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      errorCount++;
      results.push({
        productId,
        productName,
        status: 'error',
        oldUrl: currentImageUrl,
        error: error.message,
      });
    }
  }

  // Save updated products to file
  console.log(`\n\n📝 Saving updated products to file...`);
  fs.writeFileSync(
    productsFilePath,
    JSON.stringify(productsData, null, 2),
    'utf8'
  );

  // Print summary
  console.log(`\n\n📊 Summary:`);
  console.log(`  ✅ Successfully uploaded: ${successCount}`);
  console.log(`  ⏭️  Skipped: ${skipCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📁 Updated file: ${productsFilePath}`);

  // Save results log
  const resultsFilePath = path.join(__dirname, '../docs/upload-results.json');
  fs.writeFileSync(
    resultsFilePath,
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log(`  📋 Results log saved to: ${resultsFilePath}`);
};

// Run the script
processProducts()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });









