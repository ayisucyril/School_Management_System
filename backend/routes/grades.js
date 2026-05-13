const express = require('express');
const { Grade, Teacher } = require('../models/Models');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Get grades - teachers only see grades they recorded
router.get('/', protect, async (req, res) => {
  try {
    const { studentId, subject, term, academicYear } = req.query;
    let query = {};
    if (studentId) query.studentId = studentId;
    if (subject) query.subject = subject;
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;

    // Teachers can only see grades they recorded
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile) query.teacherId = teacherProfile._id;
    }

    const grades = await Grade.find(query)
      .populate({
        path: 'studentId',
        select: 'name studentId classId',
        populate: { path: 'classId', select: 'name grade section' }  
      })
      .populate('teacherId', 'name subject')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: grades.length, grades });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Upload result - admin and teacher
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    let gradeData = { ...req.body };

    // Auto-attach classId from student
    if (gradeData.studentId) {
      const student = await Student.findById(gradeData.studentId).select('classId');
      if (student?.classId) gradeData.classId = student.classId;
    }

    // Auto-attach teacher profile if logged in as teacher
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile) {
        gradeData.teacherId = teacherProfile._id;
        // Teacher can only upload their own subject
        if (!gradeData.subject) gradeData.subject = teacherProfile.subject;
      }
    }

    const grade = await Grade.create(gradeData);
    res.status(201).json({ success: true, grade });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk upload results - admin and teacher
router.post('/bulk', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;

    // Auto-attach classId for each student
    let gradeRecords = await Promise.all(records.map(async r => {
      const student = await Student.findById(r.studentId).select('classId');
      return { ...r, classId: student?.classId || r.classId };
    }));

    // Auto-attach teacherId if logged in as teacher
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile) {
        gradeRecords = gradeRecords.map(r => ({
          ...r,
          teacherId: teacherProfile._id,
          subject: r.subject || teacherProfile.subject
        }));
      }
    }

    const created = await Grade.insertMany(gradeRecords);
    res.status(201).json({ success: true, count: created.length, grades: created });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update result - admin and teacher (teacher can only update their own)
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ error: 'Grade not found' });

    // Teacher can only update grades they recorded
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile && grade.teacherId?.toString() !== teacherProfile._id.toString()) {
        return res.status(403).json({ error: 'You can only update grades you recorded' });
      }
    }

    const updated = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, grade: updated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete result - admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Grade deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;