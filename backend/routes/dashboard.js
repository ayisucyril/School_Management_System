const express = require('express');
const Student = require('../models/Student');
const { Teacher, Class, Grade, Attendance, Announcement } = require('../models/Models');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    const [students, teachers, classes, announcements] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Teacher.countDocuments({ status: 'active' }),
      Class.countDocuments(),
      Announcement.countDocuments()
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'present' });
    const recentAnnouncements = await Announcement.find().sort({ createdAt: -1 }).limit(5);
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).populate('classId', 'name grade');

    const gradeStats = await Grade.aggregate([
      { $group: { _id: '$subject', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
      { $sort: { avgScore: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: { students, teachers, classes, announcements, todayAttendance },
      recentAnnouncements,
      recentStudents,
      gradeStats
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
