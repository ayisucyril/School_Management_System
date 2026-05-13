const mongoose = require('mongoose');

// ─── Helper: compute letter grade from score ──────────────────────────────
function computeGrade(score) {
  if (score == null) return null;
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Teacher Schema ───────────────────────────────────────────────────────
const teacherSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teacherId:     { type: String, unique: true, required: true },
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, lowercase: true },
  phone:         { type: String, default: '' },
  subject:       { type: String, required: true },
  qualification: { type: String, default: '' },
  experience:    { type: Number, default: 0 },
  gender:        { type: String, enum: ['male', 'female', 'other'] },
  address:       { type: String, default: '' },
  joinDate:      { type: Date, default: Date.now },
  status:        { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  avatar:        { type: String, default: '' },
  createdAt:     { type: Date, default: Date.now }
});

// ─── Class Schema ─────────────────────────────────────────────────────────
const classSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  grade:        { type: String, required: true },
  section:      { type: String, default: 'A' },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  capacity:     { type: Number, default: 40 },
  room:         { type: String, default: '' },
  schedule:     { type: String, default: '' },
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  subjects:     { type: [String], default: [] },
  createdAt:    { type: Date, default: Date.now }
});

// ─── Grade Schema ─────────────────────────────────────────────────────────
const gradeSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subject:      { type: String, required: true },
  score:        { type: Number, required: true, min: 0, max: 100 },
  grade:        { type: String },   // auto-computed from score
  term:         { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  remarks:      { type: String, default: '' },
  createdAt:    { type: Date, default: Date.now }
});

// Covers: Grade.create() and grade.save()
gradeSchema.pre('save', function (next) {
  this.grade = computeGrade(this.score);
  next();
});

// Covers: Grade.findByIdAndUpdate() and Grade.findOneAndUpdate()
gradeSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const score = update?.score ?? update?.$set?.score;
  if (score != null) {
    if (!update.$set) update.$set = {};
    update.$set.grade = computeGrade(Number(score));
  }
  next();
});

// Covers: Grade.insertMany() — must compute grade manually before calling
// (Mongoose does NOT run hooks for insertMany — handled in the route)

// ─── Attendance Schema ────────────────────────────────────────────────────
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date:      { type: Date, required: true },
  status:    { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  markedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  remarks:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// ─── Announcement Schema ──────────────────────────────────────────────────
const announcementSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  content:        { type: String, required: true },
  author:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName:     { type: String, default: '' },
  targetAudience: { type: String, enum: ['all', 'students', 'teachers', 'parents'], default: 'all' },
  priority:       { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt:      { type: Date, default: Date.now }
});

// ─── Report Draft Schema ──────────────────────────────────────────────────
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

// ─── Exports ──────────────────────────────────────────────────────────────
module.exports = {
  Teacher:      mongoose.model('Teacher', teacherSchema),
  Class:        mongoose.model('Class', classSchema),
  Grade:        mongoose.model('Grade', gradeSchema),
  Attendance:   mongoose.model('Attendance', attendanceSchema),
  Announcement: mongoose.model('Announcement', announcementSchema),
  ReportDraft:  mongoose.model('ReportDraft', reportDraftSchema),
};