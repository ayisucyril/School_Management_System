const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Teacher } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Login - works for admin, teacher, student
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });

    // If teacher, attach teacher profile info
    let teacherProfile = null;
    if (user.role === 'teacher') {
      teacherProfile = await Teacher.findOne({ userId: user._id });
    }

    res.json({ success: true, token: generateToken(user._id), user, teacherProfile });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Setup first admin (only once)
router.post('/setup', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(403).json({ error: 'Admin already exists' });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ success: true, token: generateToken(user._id), user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get current logged in user
router.get('/me', protect, async (req, res) => {
  try {
    let teacherProfile = null;
    if (req.user.role === 'teacher') {
      teacherProfile = await Teacher.findOne({ userId: req.user._id });
    }
    res.json({ success: true, user: req.user, teacherProfile });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Register any user - admin only
router.post('/register', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create teacher account + profile in one step - admin only
router.post('/create-teacher', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name, email, password, phone, subject,
      qualification, experience, gender, address
    } = req.body;

    if (!name || !email || !password || !subject) {
      return res.status(400).json({ error: 'Name, email, password and subject are required' });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use' });

    // Create login account
    const user = await User.create({ name, email, password, role: 'teacher' });

    // Create teacher profile linked to user
    const count = await Teacher.countDocuments();
    const teacherId = `TCH${String(count + 1).padStart(4, '0')}`;
    const teacher = await Teacher.create({
      userId: user._id,
      teacherId,
      name, email, phone, subject,
      qualification, experience, gender, address
    });

    res.status(201).json({
      success: true,
      message: 'Teacher account and profile created successfully',
      user,
      teacher
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all teacher accounts - admin only
router.get('/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({ success: true, count: teachers.length, teachers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reset teacher password - admin only
router.put('/reset-password/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'New password required' });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
