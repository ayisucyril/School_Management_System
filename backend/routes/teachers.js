const express = require('express');
const { Teacher } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
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

module.exports = router;
