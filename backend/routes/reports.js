const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const { Grade, Attendance, Class, Teacher, ReportDraft } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// ─── GET /api/reports/terminal ───────────────────────────────────────────────
// Query params: studentId, term, academicYear
// Access: admin (any student) | teacher (students in their class)
router.get('/terminal', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.query;

    if (!studentId || !term) {
      return res.status(400).json({ error: 'studentId and term are required' });
    }

    const year = academicYear || new Date().getFullYear().toString();

    // ── 1. Fetch student ──────────────────────────────────────────────────────
    const student = await Student.findById(studentId)
      .populate('classId', 'name grade section teacherId capacity');

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // ── 2. Fetch class teacher ────────────────────────────────────────────────
    let classTeacher = null;
    if (student.classId?.teacherId) {
      classTeacher = await Teacher.findById(student.classId.teacherId).select('name');
    }

    // ── 3. Fetch grades for this student, term, year ──────────────────────────
    const grades = await Grade.find({
      studentId: student._id,
      term,
      academicYear: year
    }).populate('teacherId', 'name subject').sort({ subject: 1 });

    if (grades.length === 0) {
      return res.status(404).json({ error: `No grades found for ${term} ${year}` });
    }

    // ── 4. Compute student average ────────────────────────────────────────────
    const total = grades.reduce((sum, g) => sum + g.score, 0);
    const average = parseFloat((total / grades.length).toFixed(1));

    // ── 5. Compute class position ─────────────────────────────────────────────
    let position = null;
    let classSize = null;

    if (student.classId) {
      // Count active students in the class
      classSize = await Student.countDocuments({ classId: student.classId._id, status: 'active' });

      // Aggregate average score per student for this term using studentId-based matching
      // This works even if some grades don't have classId yet
      const classmateIds = (
        await Student.find({ classId: student.classId._id, status: 'active' }).select('_id')
      ).map(s => s._id);

      const classAverages = await Grade.aggregate([
        {
          $match: {
            studentId: { $in: classmateIds },
            term,
            academicYear: year
          }
        },
        { $group: { _id: '$studentId', avg: { $avg: '$score' } } },
        { $sort: { avg: -1 } }
      ]);

      const rank = classAverages.findIndex(r => r._id.toString() === student._id.toString());
      position = rank >= 0 ? rank + 1 : null;
    }

    // ── 6. Fetch attendance for this term ─────────────────────────────────────
    const termMonths = { 'Term 1': [0,1,2,3], 'Term 2': [4,5,6,7], 'Term 3': [8,9,10,11] };
    const months = termMonths[term] || [];

    const allAttendance = await Attendance.find({
      studentId: student._id,
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    });

    const termAttendance = allAttendance.filter(a => months.includes(new Date(a.date).getMonth()));

    const daysPresent  = termAttendance.filter(a => a.status === 'present').length;
    const daysAbsent   = termAttendance.filter(a => a.status === 'absent').length;
    const daysLate     = termAttendance.filter(a => a.status === 'late').length;
    const totalDays    = termAttendance.length;
    const attendancePct = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : null;

    // ── 7. Build grade label helper ───────────────────────────────────────────
    function gradeLabel(score) {
      if (score >= 90) return { grade: 'A+', label: 'Outstanding' };
      if (score >= 80) return { grade: 'A',  label: 'Excellent' };
      if (score >= 70) return { grade: 'B+', label: 'Very Good' };
      if (score >= 60) return { grade: 'B',  label: 'Good' };
      if (score >= 50) return { grade: 'C',  label: 'Average' };
      if (score >= 40) return { grade: 'D',  label: 'Below Average' };
      return            { grade: 'F',  label: 'Fail' };
    }

    // ── 8. Shape response ─────────────────────────────────────────────────────
    const report = {
      generatedAt: new Date().toISOString(),
      term,
      academicYear: year,

      student: {
        id:           student._id,
        studentId:    student.studentId,
        name:         student.name,
        gender:       student.gender,
        dateOfBirth:  student.dateOfBirth,
        email:        student.email,
        parentName:   student.parentName,
        parentPhone:  student.parentPhone,
      },

      class: student.classId ? {
        name:        student.classId.name,
        grade:       student.classId.grade,
        section:     student.classId.section,
        teacher:     classTeacher?.name || 'N/A',
        classSize,
      } : null,

      subjects: grades.map(g => ({
        subject:  g.subject,
        score:    g.score,
        grade:    g.grade || gradeLabel(g.score).grade,
        label:    gradeLabel(g.score).label,
        remarks:  g.remarks,
        teacher:  g.teacherId?.name || '',
      })),

      summary: {
        totalSubjects: grades.length,
        totalScore:    total,
        average,
        overallGrade:  gradeLabel(average).grade,
        overallLabel:  gradeLabel(average).label,
        position,
        classSize,
      },

      attendance: {
        daysPresent,
        daysAbsent,
        daysLate,
        totalDays,
        attendancePct,
      },
    };

    res.json({ success: true, report });

  } catch (err) {
    console.error('Terminal report error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/reports/terminal/class ─────────────────────────────────────────
router.get('/terminal/class', protect, authorize('admin'), async (req, res) => {
  try {
    const { classId, term, academicYear } = req.query;
    if (!classId || !term) return res.status(400).json({ error: 'classId and term are required' });

    const students = await Student.find({ classId, status: 'active' }).select('_id');
    const year = academicYear || new Date().getFullYear().toString();

    const classmateIds = students.map(s => s._id);

    const averages = await Grade.aggregate([
      { $match: { studentId: { $in: classmateIds }, term, academicYear: year } },
      { $group: { _id: '$studentId', average: { $avg: '$score' }, count: { $sum: 1 } } },
      { $sort: { average: -1 } }
    ]);

    res.json({ success: true, classSize: students.length, rankings: averages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SAVE DRAFT ───────────────────────────────────────────────────────────────
router.post('/terminal/draft', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, term, academicYear, teacherComment, headComment } = req.body;
    if (!studentId || !term || !academicYear)
      return res.status(400).json({ error: 'studentId, term and academicYear are required' });

    const draft = await ReportDraft.findOneAndUpdate(
      { studentId, term, academicYear },
      { teacherComment, headComment, savedBy: req.user._id, savedAt: new Date(), status: 'draft' },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Draft saved successfully', draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOAD DRAFT ───────────────────────────────────────────────────────────────
router.get('/terminal/draft', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.query;
    if (!studentId || !term || !academicYear)
      return res.status(400).json({ error: 'studentId, term and academicYear are required' });

    const draft = await ReportDraft.findOne({ studentId, term, academicYear });
    if (!draft) return res.json({ success: true, draft: null });
    res.json({ success: true, draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── FINALIZE REPORT ──────────────────────────────────────────────────────────
router.patch('/terminal/draft/finalize', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId, term, academicYear } = req.body;
    const draft = await ReportDraft.findOneAndUpdate(
      { studentId, term, academicYear },
      { status: 'finalized' },
      { new: true }
    );
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    res.json({ success: true, message: 'Report finalized', draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
