const express = require('express');
const { Announcement } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, announcements });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user._id,
      authorName: req.user.name
    });
    res.status(201).json({ success: true, announcement });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
