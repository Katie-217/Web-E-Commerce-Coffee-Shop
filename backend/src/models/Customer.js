const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, unique: true, lowercase: true, required: true },
  password: { type: String, required: true, select: false }, // nhớ select:false
  avatar: { type: String, default: '' }
}, { timestamps: true });

// Hash password khi tạo/sửa
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

CustomerSchema.pre(['findOneAndUpdate','updateOne'], async function(next) {
  const update = this.getUpdate() || {};
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema);
