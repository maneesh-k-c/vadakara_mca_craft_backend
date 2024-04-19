const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
    login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
    product_id: { type: mongoose.Types.ObjectId, ref: 'product_tb' },
    feedback: { type: String, require: true },
    reply: { type: String },
});

var feedbackData = mongoose.model('feedback_tb', feedbackSchema);
module.exports = feedbackData;
