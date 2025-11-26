const fs = require('fs');
const path = require('path');

const customersPath = path.join(__dirname, '../docs/customersList.json');
const productsPath = path.join(__dirname, '../docs/productsList.json');

const customers = JSON.parse(fs.readFileSync(customersPath, 'utf8'));
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const validIds = products
  .map((product) => product.id)
  .filter((id) => id !== undefined && id !== null);

const validIdSet = new Set(validIds.map((id) => String(id)));

if (!validIds.length) {
  console.error('No valid product IDs found in productsList.json');
  process.exit(1);
}

let replacements = 0;

customers.forEach((customer) => {
  if (!Array.isArray(customer.wishlist)) {
    return;
  }

  customer.wishlist = customer.wishlist.map((item, index) => {
    if (!item || item.productId === undefined || item.productId === null) {
      return item;
    }

    const productIdStr = String(item.productId);
    if (validIdSet.has(productIdStr)) {
      return { ...item, productId: Number(productIdStr) };
    }

    const replacementId = validIds[(replacements + index) % validIds.length];
    replacements += 1;
    return {
      ...item,
      productId: replacementId,
    };
  });
});

fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2));
console.log(`✅ Updated wishlist product IDs. Replacements made: ${replacements}`);










