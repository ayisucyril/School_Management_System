const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Teacher } = require('../models/Models');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Login
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

// Initial admin setup
router.post('/setup', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(403).json({ error: 'Admin already exists' });
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'admin', isFirstLogin: false });
    res.status(201).json({ success: true, token: generateToken(user._id), user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get current user
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

// Admin creates teacher account
router.post('/create-teacher', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, subject, phone, qualification, experience, gender, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    // Create user account
    const user = await User.create({
      name, email, password,
      role: 'teacher',
      isFirstLogin: true,
      mustChangePassword: true
    });

    // Create teacher profile
    const count = await Teacher.countDocuments();
    const teacherId = `TCH${String(count + 1).padStart(4, '0')}`;
    await Teacher.create({
      userId: user._id,
      teacherId, name, email,
      phone: phone || '',
      subject: subject || '',
      qualification: qualification || '',
      experience: experience || 0,
      gender: gender || 'male',
      address: address || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: `Teacher account created successfully`,
      credentials: { email, password: req.body.password },
      user
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);

    // If not first login, verify current password
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

// Skip password change (keep current password)
router.put('/skip-password-change', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isFirstLogin: false, mustChangePassword: false });
    res.json({ success: true, message: 'Password maintained' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get all teacher accounts (admin only)
router.get('/teachers', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({ success: true, teachers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete teacher account
router.delete('/teachers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;