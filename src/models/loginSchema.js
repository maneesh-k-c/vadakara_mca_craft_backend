const mongoose = require('mongoose');
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: Number, required: true },
  status: { type: Number, required: true },
});

var loginData = mongoose.model('login_tb', loginSchema);
module.exports = loginData;
