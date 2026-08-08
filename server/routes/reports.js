// routes/reports.js
// Trust & Safety — user report submission

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Report = require('../models/Report');

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/reports
// Submit a report about a user or match
// Body: { reportedUserId, matchId?, reason }
// ─────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { reportedUserId, matchId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'reportedUserId and reason are required' });
    }

    // Prevent self-reporting
    if (reportedUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    const report = await Report.create({
      reportedBy:   req.user._id,
      reportedUser: reportedUserId,
      matchId:      matchId || null,
      reason,
    });

    res.status(201).json({ message: 'Report submitted. Our team will review it.', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

// ─────────────────────────────────────────
// GET /api/reports (admin view — no auth guard for demo, add in prod)
// ─────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy',   'name email')
      .populate('reportedUser', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

module.exports = router;
