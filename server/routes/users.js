// routes/users.js
// Profile and skill management for the logged-in user

const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ─────────────────────────────────────────
// GET /api/users/me
// Returns the current user's full profile
// ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware (no passwordHash)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ─────────────────────────────────────────
// PUT /api/users/me
// Update basic profile info (name, bio, location)
// Body: { name, bio, location }
// ─────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
  try {
    const { name, bio, location } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)     user.name     = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ─────────────────────────────────────────
// POST /api/users/me/skills/offered
// Add a skill this user is offering
// Body: { skillName, category, proficiency, description }
// ─────────────────────────────────────────
router.post('/me/skills/offered', protect, async (req, res) => {
  try {
    const { skillName, category, proficiency, description } = req.body;
    if (!skillName) return res.status(400).json({ message: 'skillName is required' });

    const user = await User.findById(req.user._id);
    user.skillsOffered.push({ skillName, category, proficiency, description });
    await user.save();
    res.status(201).json(user.skillsOffered);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add offered skill' });
  }
});

// ─────────────────────────────────────────
// DELETE /api/users/me/skills/offered/:skillId
// Remove an offered skill by its sub-document ID
// ─────────────────────────────────────────
router.delete('/me/skills/offered/:skillId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsOffered = user.skillsOffered.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    await user.save();
    res.json(user.skillsOffered);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove offered skill' });
  }
});

// ─────────────────────────────────────────
// POST /api/users/me/skills/wanted
// Add a skill this user wants to learn
// Body: { skillName, category, urgency, description }
// ─────────────────────────────────────────
router.post('/me/skills/wanted', protect, async (req, res) => {
  try {
    const { skillName, category, urgency, description } = req.body;
    if (!skillName) return res.status(400).json({ message: 'skillName is required' });

    const user = await User.findById(req.user._id);
    user.skillsWanted.push({ skillName, category, urgency, description });
    await user.save();
    res.status(201).json(user.skillsWanted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add wanted skill' });
  }
});

// ─────────────────────────────────────────
// DELETE /api/users/me/skills/wanted/:skillId
// ─────────────────────────────────────────
router.delete('/me/skills/wanted/:skillId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skillsWanted = user.skillsWanted.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    await user.save();
    res.json(user.skillsWanted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove wanted skill' });
  }
});

// ─────────────────────────────────────────
// GET /api/users/:id
// Public profile view of another user
// ─────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;
