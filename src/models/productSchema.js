const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  product_name: { type: String, require: true },
  price: { type: String, require: true },
  description: { type: String, require: true },
  image: { type: [String], require: true },
  quantity: { type: String, require: true },
  highlight_status: { type: String, require: true },
  status: { type: String, require: true },
});

var productData = mongoose.model('product_tb', productSchema);
module.exports = productData;
