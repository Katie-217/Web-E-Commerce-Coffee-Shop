// src/models/Voucher.js
const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true }, // % hay số tiền
  value: { type: Number, required: true },                             // vd 10 (=10%) hoặc 50000 (VND)
  minOrder: { type: Number, default: 0 },                              // đơn tối thiểu (VND)
  maxDiscount: { type: Number },                                       // trần giảm nếu type=percent
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date },                                               // ngày hết hạn
  usageLimit: { type: Number },                                        // tổng số lượt dùng toàn hệ thống
  used: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },                          // mỗi user dùng tối đa
  allowedCategories: [{ type: String }],                               // chỉ áp cho category cụ thể (optional)
  allowedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // optional
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);
