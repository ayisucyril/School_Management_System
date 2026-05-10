const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { Teacher } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ─── Login ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({
      success: true,
      token: generateToken(user._id),
      user,
      isFirstLogin: user.isFirstLogin,
      mustChangePassword: user.mustChangePassword
    });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─── Initial admin setup ──────────────────────────────────────────────────────
router.post('/setup', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(403).json({ error: 'Admin already exists' });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'admin', isFirstLogin: false });
    res.status(201).json({ success: true, token: generateToken(user._id), user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Get current user ─────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

// ─── Change password ──────────────────────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = await User.findById(req.user._id);
    if (!user.isFirstLogin) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password is required' });
      if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    user.isFirstLogin = false;
    user.mustChangePassword = false;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Skip password change ─────────────────────────────────────────────────────
router.put('/skip-password-change', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isFirstLogin: false, mustChangePassword: false });
    res.json({ success: true, message: 'Password maintained' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── TEACHER ROUTES ───────────────────────────────────────────────────────────

// Create teacher login from existing teacher profile
// Frontend sends only { teacherProfileId } — all details pulled from Teacher model
router.post('/create-teacher', protect, authorize('admin'), async (req, res) => {
  try {
    const { teacherProfileId } = req.body;

    if (!teacherProfileId) return res.status(400).json({ error: 'teacherProfileId is required' });

    // Find the teacher profile
    const teacher = await Teacher.findById(teacherProfileId);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found in records' });

    // Must have an email
    if (!teacher.email) return res.status(400).json({ error: 'This teacher has no email address. Add their email first.' });

    // Check if account already exists
    const exists = await User.findOne({ email: teacher.email });
    if (exists) return res.status(400).json({ error: 'A login account already exists for this teacher' });

    // Default password: FirstName + last 4 of teacherId e.g. "John0001"
    const firstName     = teacher.name.split(' ')[0];
    const suffix        = teacher.teacherId.slice(-4);
    const defaultPassword = `${firstName}${suffix}`;

    // Create user account
    const user = await User.create({
      name:               teacher.name,
      email:              teacher.email,
      password:           defaultPassword,
      role:               'teacher',
      isFirstLogin:       true,
      mustChangePassword: true,
    });

    // Link user account back to teacher profile
    await Teacher.findByIdAndUpdate(teacherProfileId, { userId: user._id });

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully',
      credentials: { email: teacher.email, password: defaultPassword },
      user,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all teacher accounts
router.get('/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'teacher' }).select('-password');
    // Enrich with teacher profile
    const enriched = await Promise.all(users.map(async u => {
      const profile = await Teacher.findOne({ userId: u._id });
      return { ...u.toObject(), teacherProfile: profile };
    }));
    res.json({ success: true, teachers: enriched });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reset teacher password
router.put('/teachers/:id/reset-password', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'teacher') return res.status(404).json({ error: 'Teacher account not found' });
    const profile   = await Teacher.findOne({ userId: user._id });
    const firstName = user.name.split(' ')[0];
    const suffix    = profile?.teacherId?.slice(-4) || '0000';
    const newPassword = `${firstName}${suffix}`;
    user.password           = newPassword;
    user.isFirstLogin       = true;
    user.mustChangePassword = true;
    await user.save();
    res.json({ success: true, message: 'Password reset', credentials: { email: user.email, password: newPassword } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete teacher account
router.delete('/teachers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'teacher') return res.status(404).json({ error: 'Teacher account not found' });
    await Teacher.findOneAndUpdate({ userId: user._id }, { $unset: { userId: 1 } });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

// Create student login from existing admission record
router.post('/create-student', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });

    const student = await Student.findById(studentId).populate('classId', 'name grade section');
    if (!student) return res.status(404).json({ error: 'Student not found in admission records' });

    if (!student.email) return res.status(400).json({ error: 'This student has no email address. Go to Students and add their email first.' });

    const exists = await User.findOne({ email: student.email });
    if (exists) return res.status(400).json({ error: 'A login account already exists for this student' });

    const firstName     = student.name.split(' ')[0];
    const suffix        = student.studentId.slice(-4);
    const defaultPassword = `${firstName}${suffix}`;

    const user = await User.create({
      name:               student.name,
      email:              student.email,
      password:           defaultPassword,
      role:               'student',
      isFirstLogin:       true,
      mustChangePassword: true,
    });

    await Student.findByIdAndUpdate(studentId, { userId: user._id });

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      credentials: { email: student.email, password: defaultPassword },
      user,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all student accounts
router.get('/students', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('-password');
    const enriched = await Promise.all(users.map(async u => {
      const profile = await Student.findOne({ userId: u._id }).populate('classId', 'name grade');
      return { ...u.toObject(), studentProfile: profile };
    }));
    res.json({ success: true, students: enriched });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reset student password
router.put('/students/:id/reset-password', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') return res.status(404).json({ error: 'Student account not found' });
    const profile   = await Student.findOne({ userId: user._id });
    const firstName = user.name.split(' ')[0];
    const suffix    = profile?.studentId?.slice(-4) || '0000';
    const newPassword = `${firstName}${suffix}`;
    user.password           = newPassword;
    user.isFirstLogin       = true;
    user.mustChangePassword = true;
    await user.save();
    res.json({ success: true, message: 'Password reset', credentials: { email: user.email, password: newPassword } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete student account
router.delete('/students/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'student') return res.status(404).json({ error: 'Student account not found' });
    await Student.findOneAndUpdate({ userId: user._id }, { $unset: { userId: 1 } });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;