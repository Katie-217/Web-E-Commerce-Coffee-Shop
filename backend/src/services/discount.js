// src/services/discount.js
function calcVoucherDiscount(voucher, cartItems) {
  // cartItems: [{ productId, name, category, price, qty }]
  let subtotal = 0;
  let eligibleTotal = 0;

  for (const it of cartItems) {
    const line = it.price * it.qty;
    subtotal += line;

    const inCat = !voucher.allowedCategories?.length || voucher.allowedCategories.includes(it.category);
    const inList = !voucher.allowedProducts?.length || voucher.allowedProducts.some(id => String(id) === String(it.productId));
    if (inCat && inList) eligibleTotal += line;
  }

  if (subtotal < (voucher.minOrder || 0)) return { discount: 0, reason: 'MIN_ORDER' };

  let discount = 0;
  if (voucher.type === 'percent') {
    discount = (eligibleTotal * voucher.value) / 100;
    if (voucher.maxDiscount) discount = Math.min(discount, voucher.maxDiscount);
  } else {
    discount = Math.min(voucher.value, eligibleTotal);
  }
  return { discount, subtotal, eligibleTotal };
}

module.exports = { calcVoucherDiscount };
