const express = require('express');
const { Teacher, Class } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }];
    const teachers = await Teacher.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: teachers.length, teachers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await Teacher.countDocuments();
    const teacherId = `TCH${String(count + 1).padStart(4, '0')}`;
    const teacher = await Teacher.create({ ...req.body, teacherId });
    res.status(201).json({ success: true, teacher });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ success: true, teacher });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/teachers/my-students — students in classes assigned to the logged-in teacher
router.get('/my-students', protect, async (req, res) => {
  try {
    // 1. Find the Teacher record linked to the logged-in user
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    // 2. Find all classes where this teacher is assigned
    const classes = await Class.find({ teacherId: teacher._id });
    if (!classes.length) return res.json({ success: true, students: [] });

    const classIds = classes.map(c => c._id);

    // 3. Find all students in those classes
    const students = await Student.find({ classId: { $in: classIds } })
      .populate('classId', 'name grade section')
      .sort({ name: 1 });

    // 4. Shape the response to match what MyStudents.jsx expects
    const shaped = students.map(s => ({
      _id:           s._id,
      name:          s.name,
      studentId:     s.studentId,
      email:         s.email,
      phone:         s.phone,
      status:        s.status === 'active'     ? 'Active'
                   : s.status === 'suspended'  ? 'Needs Attention'
                   : 'Inactive',
      class:         s.classId ? `${s.classId.grade}${s.classId.section}` : '—',
      subject:       teacher.subject,
      guardian:      s.parentName,
      guardianPhone: s.parentPhone,
      enrolledDate:  s.enrollmentDate
        ? new Date(s.enrollmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—',
      gender:        s.gender,
      dateOfBirth:   s.dateOfBirth,
      address:       s.address,
    }));

    res.json({ success: true, students: shaped });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;