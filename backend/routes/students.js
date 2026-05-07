const express = require('express');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all students
router.get('/', protect, async (req, res) => {
  try {
    const { status, classId, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (classId) query.classId = classId;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } }
    ];
    const students = await Student.find(query)
      .populate('classId', 'name grade section')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add student - admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const studentId = `STU${String(count + 1).padStart(4, '0')}`;
    const student = await Student.create({ ...req.body, studentId });
    res.status(201).json({ success: true, student });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Upload profile picture - admin only
router.post('/:id/avatar', protect, authorize('admin'), upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Delete old avatar if exists
    if (student.avatar) {
      const oldPath = path.join(__dirname, '../', student.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarPath },
      { new: true }
    ).populate('classId', 'name grade section');

    res.json({ success: true, student: updated, avatarUrl: avatarPath });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update student - admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('classId', 'name grade section');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, student });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete student - admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student?.avatar) {
      const avatarPath = path.join(__dirname, '../', student.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
