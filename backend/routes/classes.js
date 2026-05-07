const express = require('express');
const { Class } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const classes = await Class.find().populate('teacherId', 'name subject').sort({ grade: 1, section: 1 });
    res.json({ success: true, count: classes.length, classes });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, class: cls });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json({ success: true, class: cls });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
