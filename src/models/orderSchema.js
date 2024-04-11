const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
    product_id: { type: mongoose.Types.ObjectId, ref: 'product_tb' },
    quantity: { type: String, default:'1', require: true },
    total: { type: String },
    status: { type: String, default: "pending", require: true },
});

var orderData = mongoose.model('order_tb', orderSchema);
module.exports = orderData;
