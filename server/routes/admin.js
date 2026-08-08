// routes/admin.js
// Admin governance routes for platform management & moderation

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const BarterMatch = require('../models/BarterMatch');
const Report = require('../models/Report');

const router = express.Router();

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'Access denied: Admin role required. Use "Become Admin" on your profile page to test admin features.',
    requiresAdmin: true
  });
};

// ─────────────────────────────────────────
// GET /api/admin/stats
// Platform-wide statistics
// ─────────────────────────────────────────
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalMatches, completedMatches, pendingReports] = await Promise.all([
      User.countDocuments(),
      BarterMatch.countDocuments(),
      BarterMatch.countDocuments({ status: 'completed' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email skillsOffered skillsWanted createdAt');

    res.json({
      totalUsers,
      totalMatches,
      completedMatches,
      pendingReports,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// ─────────────────────────────────────────
// GET /api/admin/reports
// List all safety & trust reports
// ─────────────────────────────────────────
router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email badges')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// ─────────────────────────────────────────
// POST /api/admin/resolve-report
// Resolve a user report
// ─────────────────────────────────────────
router.post('/resolve-report', protect, adminOnly, async (req, res) => {
  try {
    const { reportId, action } = req.body; // action: 'dismiss' or 'warn'
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    await report.save();

    res.json({ message: `Report ${action}ed successfully`, report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve report' });
  }
});

module.exports = router;
