const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  name: { type: String, require: true },
  mobile: { type: String, require: true },
  address: { type: String, require: true },
});

var userData = mongoose.model('user_tb', userSchema);
module.exports = userData;
