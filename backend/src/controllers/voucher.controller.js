// src/controllers/voucher.controller.js
const Voucher = require('../models/Voucher');
const { calcVoucherDiscount } = require('../services/discount');
const Order = require('../models/Order');

exports.apply = async (req, res) => {
  const { code, items } = req.body; // items = [{productId, category, price, qty}]
  const userId = req.user?._id;

  const v = await Voucher.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!v) return res.status(404).json({ message: 'Voucher không tồn tại' });

  const now = new Date();
  if (v.startAt && v.startAt > now) return res.status(400).json({ message: 'Voucher chưa bắt đầu' });
  if (v.endAt && v.endAt < now) return res.status(400).json({ message: 'Voucher đã hết hạn' });
  if (v.usageLimit && v.used >= v.usageLimit) return res.status(400).json({ message: 'Voucher đã hết lượt dùng' });

  // per-user usage
  if (userId && v.perUserLimit) {
    const times = await Order.countDocuments({ user: userId, voucherCode: v.code });
    if (times >= v.perUserLimit) return res.status(400).json({ message: 'Bạn đã dùng voucher này tối đa số lần cho phép' });
  }

  const { discount, subtotal } = calcVoucherDiscount(v, items || []);
  if (discount <= 0) return res.status(400).json({ message: 'Giỏ hàng không đủ điều kiện áp dụng' });

  res.json({ code: v.code, type: v.type, value: v.value, discount, subtotal });
};
