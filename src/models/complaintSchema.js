const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
    login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
    product_id: { type: mongoose.Types.ObjectId, ref: 'product_tb' },
    title: { type: String, require: true },
    complaint: { type: String, require: true },
    reply: { type: String },
    status: { type: String},
});

var complaintData = mongoose.model('complaint_tb', complaintSchema);
module.exports = complaintData;
