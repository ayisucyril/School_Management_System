const express = require('express');
const { Attendance, Teacher } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Get attendance - teachers only see attendance they marked
router.get('/', protect, async (req, res) => {
  try {
    const { studentId, classId, date, status } = req.query;
    let query = {};
    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;
    if (date) query.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    if (status) query.status = status;

    // Teachers only see attendance they marked
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile) query.markedBy = teacherProfile._id;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name studentId')
      .populate('classId', 'name grade')
      .populate('markedBy', 'name subject')
      .sort({ date: -1 });
    res.json({ success: true, count: attendance.length, attendance });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Mark single attendance - admin and teacher
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    let attendanceData = { ...req.body };

    // Auto-attach teacher profile if logged in as teacher
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile) attendanceData.markedBy = teacherProfile._id;
    }

    const record = await Attendance.create(attendanceData);
    res.status(201).json({ success: true, record });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk mark attendance (register) - admin and teacher
router.post('/bulk', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { records } = req.body;
    let attendanceRecords = records;

    // Auto-attach teacherId if logged in as teacher
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile) {
        attendanceRecords = records.map(r => ({
          ...r,
          markedBy: teacherProfile._id
        }));
      }
    }

    // Remove duplicates for same student on same date
    const created = [];
    for (const record of attendanceRecords) {
      const existing = await Attendance.findOne({
        studentId: record.studentId,
        date: {
          $gte: new Date(new Date(record.date).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(record.date).setHours(23, 59, 59, 999))
        }
      });
      if (existing) {
        // Update existing record
        await Attendance.findByIdAndUpdate(existing._id, record);
        created.push(existing);
      } else {
        const newRecord = await Attendance.create(record);
        created.push(newRecord);
      }
    }

    res.status(201).json({ success: true, count: created.length, records: created });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update attendance record - admin and teacher
router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    // Teacher can only update records they marked
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ userId: req.user._id });
      if (teacherProfile && record.markedBy?.toString() !== teacherProfile._id.toString()) {
        return res.status(403).json({ error: 'You can only update attendance you marked' });
      }
    }

    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, record: updated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete attendance - admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
