// routes/analytics.js
// Platform analytics, skill supply/demand metrics, and AI recommendations

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateMarketInsights } = require('../services/aiService');
const User = require('../models/User');
const BarterMatch = require('../models/BarterMatch');

const router = express.Router();

// ─────────────────────────────────────────
// GET /api/analytics/insights
// Returns platform-wide skill metrics and AI learning recommendations
// ─────────────────────────────────────────
router.get('/insights', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Aggregate all offered and wanted skills across all users
    const allUsers = await User.find({}, 'skillsOffered skillsWanted').lean();

    const offerCounts = {};
    const wantCounts  = {};

    allUsers.forEach((u) => {
      (u.skillsOffered || []).forEach((s) => {
        const name = s.skillName.toLowerCase().trim();
        offerCounts[name] = (offerCounts[name] || 0) + 1;
      });
      (u.skillsWanted || []).forEach((s) => {
        const name = s.skillName.toLowerCase().trim();
        wantCounts[name] = (wantCounts[name] || 0) + 1;
      });
    });

    // Format top in-demand skills
    const topWanted = Object.entries(wantCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill: skill.charAt(0).toUpperCase() + skill.slice(1), count }));

    // Format top offered skills
    const topOffered = Object.entries(offerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill: skill.charAt(0).toUpperCase() + skill.slice(1), count }));

    // Identify Skill Gaps (High demand, low supply)
    const skillGaps = Object.keys(wantCounts)
      .map((skill) => {
        const demand = wantCounts[skill] || 0;
        const supply = offerCounts[skill] || 0;
        return {
          skill: skill.charAt(0).toUpperCase() + skill.slice(1),
          demand,
          supply,
          gapScore: demand - supply,
        };
      })
      .sort((a, b) => b.gapScore - a.gapScore)
      .slice(0, 4);

    // Total stats
    const totalUsers = allUsers.length;
    const completedMatches = await BarterMatch.countDocuments({ status: 'completed' });

    // Generate AI Personalized Recommendations
    let aiAdvice = null;
    try {
      aiAdvice = await generateMarketInsights(user.skillsOffered || [], user.skillsWanted || []);
    } catch {
      aiAdvice = {
        recommendations: [
          { title: 'Offer High Demand Skills', advice: 'Web Design and Python programming are currently the most requested skills on SkillSwap.' },
          { title: 'Complete Verification Quizzes', advice: 'Users with Verified Expert badges receive 3x more match proposals.' },
          { title: 'Set Flexible Sessions', advice: 'Online format with 3-4 sessions yields the highest swap completion rate.' },
        ],
      };
    }

    res.json({
      topWanted,
      topOffered,
      skillGaps,
      totalUsers,
      completedMatches,
      aiAdvice,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
