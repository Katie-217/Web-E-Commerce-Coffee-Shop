/**
 * Loyalty Program Utility Functions
 * 
 * Logic:
 * - Customers earn 10% of order value as points for each successful order (delivered)
 * - 1 point = 1,000 VND
 * - Example: Order 1,000,000 VND → 100 points (equivalent to 100,000 VND)
 * - Points can be used immediately in the next order, không giới hạn
 * - Chỉ dùng ở đơn tiếp theo (không dùng ở cùng đơn)
 * - Không có hạn sử dụng
 */

/**
 * Calculate points earned from an order
 * Formula: pointsEarned = (orderTotal * 10%) / 1000 = orderTotal / 10000
 * Note: Calculate based on total (subtotal - discount + shippingFee)
 * 
 * @param {number} orderTotal - Order total amount
 * @returns {number} Points earned (1 point = 1,000 VND)
 */
function calculatePointsEarned(orderTotal) {
  if (!orderTotal || orderTotal <= 0) return 0;
  // 10% of order total, then divide by 1000 (1 point = 1,000 VND)
  // Example: orderTotal = 1,000,000 VND
  // - 10% = 100,000 VND
  // - 100,000 / 1000 = 100 points (equivalent to 100,000 VND)
  return Math.floor((orderTotal * 0.1) / 1000);
}

/**
 * Calculate discount amount from points used
 * Formula: discount = pointsUsed * 1000 (1 point = 1,000 VND)
 * 
 * @param {number} pointsUsed - Number of points to use
 * @returns {number} Discount amount in VND
 */
function calculateDiscountFromPoints(pointsUsed) {
  if (!pointsUsed || pointsUsed <= 0) return 0;
  return pointsUsed * 1000; // 1 point = 1,000 VND
}

/**
 * Calculate maximum points that can be used for an order
 * Limited by customer's available points and order total
 * 
 * @param {number} availablePoints - Customer's current available points
 * @param {number} orderTotal - Order total before discount
 * @returns {number} Maximum points that can be used
 */
function calculateMaxPointsUsable(availablePoints, orderTotal) {
  if (!availablePoints || availablePoints <= 0) return 0;
  if (!orderTotal || orderTotal <= 0) return 0;
  
  // Can use all available points (no limit)
  return availablePoints;
}

function validatePointsUsage(pointsToUse, availablePoints) {
  if (!pointsToUse || pointsToUse <= 0) {
    return { valid: true }; // No points to use is valid
  }
  
  if (pointsToUse > availablePoints) {
    return {
      valid: false,
      error: `Insufficient points. Available: ${availablePoints}, Requested: ${pointsToUse}`
    };
  }
  
  return { valid: true };
}

function formatPointsEarnedMessage(points) {
  if (!points || points <= 0) return '';
  const valueInVND = points * 1000; // 1 point = 1,000 VND
  return `You earned ${points} points (equivalent to ${valueInVND.toLocaleString('vi-VN')}₫).`;
}

module.exports = {
  calculatePointsEarned,
  calculateDiscountFromPoints,
  calculateMaxPointsUsable,
  validatePointsUsage,
  formatPointsEarnedMessage
};

