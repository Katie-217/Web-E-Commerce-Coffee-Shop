const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  user: { type:mongoose.Schema.Types.ObjectId, ref:'Customer', required:true },
  items: [{
    product: { type:mongoose.Schema.Types.ObjectId, ref:'Product', required:true },
    name: String, price: Number, qty: Number
  }],
  total: { type:Number, required:true },
  status: { type:String, enum:['pending','paid','shipped','completed','cancelled'], default:'pending' },
  address: { type:String, default:'' }
}, { timestamps:true });
module.exports = mongoose.model('Order', OrderSchema);
