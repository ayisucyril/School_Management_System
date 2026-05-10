const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherId: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true },
  qualification: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String, default: '' },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  grade: { type: String, required: true },
  section: { type: String, default: 'A' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  capacity: { type: Number, default: 40 },
  room: { type: String, default: '' },
  schedule: { type: String, default: '' },
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  subjects: { type: [String], default: [] }, // ← subjects assigned to this class
  createdAt: { type: Date, default: Date.now }
});

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subject: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String },
  term: { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

gradeSchema.pre('save', function(next) {
  const s = this.score;
  if (s >= 90) this.grade = 'A+';
  else if (s >= 80) this.grade = 'A';
  else if (s >= 70) this.grade = 'B+';
  else if (s >= 60) this.grade = 'B';
  else if (s >= 50) this.grade = 'C';
  else if (s >= 40) this.grade = 'D';
  else this.grade = 'F';
  next();
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: '' },
  targetAudience: { type: String, enum: ['all', 'students', 'teachers', 'parents'], default: 'all' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

const reportDraftSchema = new mongoose.Schema({
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  term:           { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
  academicYear:   { type: String, required: true },
  teacherComment: { type: String, default: '' },
  headComment:    { type: String, default: '' },
  savedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  savedAt:        { type: Date, default: Date.now },
  status:         { type: String, enum: ['draft', 'finalized'], default: 'draft' },
});
reportDraftSchema.index({ studentId: 1, term: 1, academicYear: 1 }, { unique: true });

module.exports = {
  Teacher:      mongoose.model('Teacher', teacherSchema),
  Class:        mongoose.model('Class', classSchema),
  Grade:        mongoose.model('Grade', gradeSchema),
  Attendance:   mongoose.model('Attendance', attendanceSchema),
  Announcement: mongoose.model('Announcement', announcementSchema),
  ReportDraft:  mongoose.model('ReportDraft', reportDraftSchema),
};
