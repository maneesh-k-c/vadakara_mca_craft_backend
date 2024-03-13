const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  login_id: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
  name: { type: String, require: true },
  mobile: { type: String, require: true },
  address: { type: String, require: true },
  academic_year: { type: String, require: true },
  course_name: { type: String, require: true },
  stream: { type: String, require: true },
});

var studentData = mongoose.model('student_tb', studentSchema);
module.exports = studentData;
