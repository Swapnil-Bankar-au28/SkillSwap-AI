// routes/matches.js
// Full match lifecycle: find → propose → respond → complete → rate

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { findMatches } = require('../services/matchingEngine');
const { draftAgreement } = require('../services/aiService');
const BarterMatch = require('../models/BarterMatch');
const User = require('../models/User');

const router = express.Router();

// ─────────────────────────────────────────
// GET /api/matches/find
// Runs the matching algorithm for the current user
// Returns { directMatches, chainMatches }
// ─────────────────────────────────────────
router.get('/find', protect, async (req, res) => {
  try {
    const results = await findMatches(req.user._id.toString());
    res.json(results);
  } catch (error) {
    console.error('Match find error:', error);
    res.status(500).json({ message: 'Failed to run matching algorithm' });
  }
});

// ─────────────────────────────────────────
// GET /api/matches
// Returns all matches involving the current user
// ─────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const matches = await BarterMatch.find({ participants: req.user._id })
      .populate('participants', 'name email rating badges skillsOffered skillsWanted')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
});

// ─────────────────────────────────────────
// GET /api/matches/:id
// Single match detail
// ─────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const match = await BarterMatch.findById(req.params.id)
      .populate('participants', 'name email rating badges skillsOffered skillsWanted bio');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch match' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/propose
// Propose a new match.
// Body: { participantIds: [userId, ...], matchType, exchangeSummary }
// ─────────────────────────────────────────
router.post('/propose', protect, async (req, res) => {
  try {
    const { participantIds, matchType = 'direct', exchangeSummary = [] } = req.body;

    if (!participantIds || participantIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 participants required' });
    }

    // Include the proposer if not already in the list
    const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

    const match = await BarterMatch.create({
      participants:    allParticipants,
      matchType,
      exchangeSummary,
      proposedBy:      req.user._id,
      status:          'proposed',
    });

    const populated = await match.populate('participants', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Propose error:', error);
    res.status(500).json({ message: 'Failed to propose match' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/respond
// Accept or decline a match proposal
// Body: { action: 'accept' | 'decline' }
// ─────────────────────────────────────────
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const match = await BarterMatch.findById(req.params.id)
      .populate('participants', 'name');

    if (!match) return res.status(404).json({ message: 'Match not found' });

    // Check the user is a participant
    const isParticipant = match.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not a participant in this match' });

    if (action === 'accept') {
      match.status = 'negotiating';

      // Auto-draft a barter agreement using Claude
      try {
        const participantSummary = match.exchangeSummary.map((e) => {
          const user = match.participants.find((p) => p._id.toString() === e.userId.toString());
          return { name: user ? user.name : 'Unknown', gives: e.gives, gets: e.gets };
        });
        match.agreementText = await draftAgreement(participantSummary, {});
      } catch (aiErr) {
        console.warn('Agreement draft failed, continuing without:', aiErr.message);
      }

    } else if (action === 'decline') {
      match.status = 'cancelled';
    } else {
      return res.status(400).json({ message: "action must be 'accept' or 'decline'" });
    }

    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to match' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/complete
// Mark a match as completed
// ─────────────────────────────────────────
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const match = await BarterMatch.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isParticipant = match.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    match.status = 'completed';
    await match.save();

    // Award badges to all participants
    await awardBadges(match.participants, match.matchType);

    res.json({ message: 'Match marked as completed', match });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete match' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/rate
// Rate another participant after completion
// Body: { ratedUserId, score (1-5), comment }
// ─────────────────────────────────────────
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { ratedUserId, score, comment = '' } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    const match = await BarterMatch.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed matches' });
    }

    // Check already rated
    const alreadyRated = match.ratings.some(
      (r) => r.ratedBy.toString() === req.user._id.toString() &&
             r.ratedUser.toString() === ratedUserId
    );
    if (alreadyRated) return res.status(400).json({ message: 'Already rated this user for this match' });

    // Save rating on the match
    match.ratings.push({
      ratedBy:   req.user._id,
      ratedUser: ratedUserId,
      score,
      comment,
    });
    await match.save();

    // Update the rated user's rolling average rating
    const ratedUser = await User.findById(ratedUserId);
    if (ratedUser) {
      const totalScore  = ratedUser.rating.average * ratedUser.rating.count + score;
      ratedUser.rating.count   += 1;
      ratedUser.rating.average  = totalScore / ratedUser.rating.count;
      await ratedUser.save();
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/update-agreement
// Update the agreement text (e.g. after negotiation chat)
// Body: { agreementText, sessions }
// ─────────────────────────────────────────
router.post('/:id/update-agreement', protect, async (req, res) => {
  try {
    const { agreementText, sessions } = req.body;
    const match = await BarterMatch.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isParticipant = match.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this match' });

    if (agreementText) match.agreementText = agreementText;
    if (sessions)      match.sessions = sessions;
    match.status = 'agreed';

    await match.save();
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update agreement' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/roadmap
// Generates a 4-week structured AI session roadmap using Gemini
// ─────────────────────────────────────────
router.post('/:id/roadmap', protect, async (req, res) => {
  try {
    const { generateRoadmap } = require('../services/aiService');
    const match = await BarterMatch.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isParticipant = match.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this match' });

    const gives = match.exchangeSummary[0]?.gives || 'Skill A';
    const gets  = match.exchangeSummary[0]?.gets  || 'Skill B';

    const roadmapData = await generateRoadmap(gives, gets);
    match.sessionRoadmap = roadmapData;
    await match.save();

    res.json(match);
  } catch (error) {
    console.error('Roadmap error:', error);
    res.status(500).json({ message: 'Failed to generate roadmap' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/toggle-roadmap-item
// Toggle completion of a week in the roadmap
// Body: { weekIndex }
// ─────────────────────────────────────────
router.post('/:id/toggle-roadmap-item', protect, async (req, res) => {
  try {
    const { weekIndex } = req.body;
    const match = await BarterMatch.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isParticipant = match.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this match' });

    if (match.sessionRoadmap[weekIndex]) {
      match.sessionRoadmap[weekIndex].completed = !match.sessionRoadmap[weekIndex].completed;
      await match.save();
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle item' });
  }
});

// ─────────────────────────────────────────
// POST /api/matches/:id/video-room
// Create or get unique Jitsi Video Call room ID
// ─────────────────────────────────────────
router.post('/:id/video-room', protect, async (req, res) => {
  try {
    const match = await BarterMatch.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const isParticipant = match.participants.some((p) => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized for this match' });

    if (!match.videoRoomId) {
      match.videoRoomId = `SkillSwap-${match._id}-${Math.floor(1000 + Math.random() * 9000)}`;
      await match.save();
    }

    res.json({ videoRoomId: match.videoRoomId, roomUrl: `https://meet.jit.si/${match.videoRoomId}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create video room' });
  }
});

// ─────────────────────────────────────────
// HELPER: Award badges based on match activity
// ─────────────────────────────────────────
const awardBadges = async (participantIds, matchType) => {
  for (const userId of participantIds) {
    const user = await User.findById(userId);
    if (!user) continue;

    const completedCount = await BarterMatch.countDocuments({
      participants: userId,
      status: 'completed',
    });

    const newBadges = [];

    if (completedCount === 1 && !user.badges.includes('First Swap')) {
      newBadges.push('First Swap');
    }
    if (completedCount >= 5 && !user.badges.includes('5 Swaps Completed')) {
      newBadges.push('5 Swaps Completed');
    }
    if (matchType === 'chain' && !user.badges.includes('Chain Match Pioneer')) {
      newBadges.push('Chain Match Pioneer');
    }

    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      await user.save();
    }
  }
};

module.exports = router;
