const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: String,
  type: {
    type: String,
    enum: ['shipping', 'billing'],
    default: 'shipping'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  ward: String,
  district: String,
  city: String,
  provinceCode: String,
  postalCode: String,
  country: {
    type: String,
    default: 'VN'
  },
  notes: String
}, { _id: false });

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['cash', 'card', 'bank'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  provider: String,
  accountNumber: String,
  accountName: String,
  brand: String,
  last4: String,
  card: {
    brand: String,
    last4: String
  }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  dateOfBirth: Date,
  avatarUrl: String,
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update updatedAt before saving
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
// Note: email already has unique index, so we don't need to add it again
customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ fullName: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

