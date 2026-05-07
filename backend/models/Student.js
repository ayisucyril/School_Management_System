const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String, default: '' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  parentName: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  parentEmail: { type: String, default: '' },
  enrollmentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
