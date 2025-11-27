const fs = require('fs');
const path = require('path');

const customersFile = path.join(__dirname, '../docs/customersList.json');

const customers = JSON.parse(fs.readFileSync(customersFile, 'utf8'));

let updatedItems = 0;

customers.forEach((customer) => {
  if (!Array.isArray(customer.wishlist)) return;

  customer.wishlist = customer.wishlist.map((item) => {
    if (item && typeof item === 'object') {
      if (item.isOnSale === undefined) {
        const isOnSale = Math.random() < 0.25;
        updatedItems += 1;
        return { ...item, isOnSale };
      }
      return item;
    }
    return item;
  });
});

fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));
console.log(`✅ Added isOnSale flag to ${updatedItems} wishlist items`);











