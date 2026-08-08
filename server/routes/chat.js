// routes/chat.js
// AI chatbot endpoint — sends user messages to Claude and returns AI replies

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendChatMessage, extractSkillsFromReply } = require('../services/aiService');
const { findMatches } = require('../services/matchingEngine');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/chat/message
// Body: { content, matchId? }
// Returns: { reply, extractedSkills?, matchId? }
// ─────────────────────────────────────────
router.post('/message', protect, async (req, res) => {
  try {
    const { content, matchId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const userId = req.user._id;

    // ── 1. Load recent conversation history (last 20 messages) ──
    const historyQuery = matchId
      ? { userId, matchId }
      : { userId, matchId: null };

    const history = await ChatMessage.find(historyQuery)
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const formattedHistory = history.map((m) => ({
      role:    m.role,
      content: m.content,
    }));

    // ── 2. If no matchId (general matchmaking chat), run the matching algorithm ──
    // so Claude can discuss real candidates with the user
    let candidateMatches = null;
    if (!matchId) {
      const matchResult = await findMatches(userId.toString());
      candidateMatches = [
        ...matchResult.directMatches.slice(0, 3),
        ...matchResult.chainMatches.slice(0, 2),
      ];
    }

    // ── 3. Save the user's message to DB ───────────────────────
    await ChatMessage.create({
      userId,
      matchId: matchId || null,
      role:    'user',
      content,
    });

    // Load full user profile to provide context to Gemini AI
    const userProfile = await User.findById(userId).lean();

    // ── 4. Send to Gemini AI ─────────────────────────────────────
    let matchContext = null;
    if (matchId) {
      const BarterMatch = require('../models/BarterMatch');
      matchContext = await BarterMatch.findById(matchId).lean();
    }

    const aiReply = await sendChatMessage(content, formattedHistory, matchContext, candidateMatches, userProfile);

    // ── 5. Parse reply for extracted skills ────────────────────
    const { hasExtraction, skillsOffered, skillsWanted, cleanReply } =
      extractSkillsFromReply(aiReply);

    // ── 6. Save AI reply to DB ─────────────────────────────────
    await ChatMessage.create({
      userId,
      matchId: matchId || null,
      role:    'assistant',
      content: cleanReply,
      extractedSkills: hasExtraction ? { offered: skillsOffered, wanted: skillsWanted } : undefined,
    });

    // ── 7. Return response ─────────────────────────────────────
    res.json({
      reply:        cleanReply,
      hasExtraction,
      extractedSkills: hasExtraction ? { offered: skillsOffered, wanted: skillsWanted } : null,
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    // Check if it's an Anthropic billing/credit error
    const isCreditsError = error.message?.includes('credit balance') || error.status === 400;
    if (isCreditsError) {
      return res.status(402).json({
        message: 'AI credits exhausted',
        reply: "⚠️ The AI service needs a top-up! Please add credits at console.anthropic.com → Plans & Billing. Everything else (matching, profile, auth) still works fine.",
      });
    }
    res.status(500).json({ message: 'AI chat failed', error: error.message });
  }
});

// ─────────────────────────────────────────
// POST /api/chat/confirm-skills
// Called when user confirms the extracted skills to save them to their profile
// Body: { skillsOffered: [...], skillsWanted: [...] }
// ─────────────────────────────────────────
router.post('/confirm-skills', protect, async (req, res) => {
  try {
    const { skillsOffered = [], skillsWanted = [] } = req.body;
    const user = await User.findById(req.user._id);

    // Append extracted skills to the user's profile
    skillsOffered.forEach((s) => user.skillsOffered.push(s));
    skillsWanted.forEach((s)  => user.skillsWanted.push(s));

    await user.save();
    res.json({ message: 'Skills saved to your profile!', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save skills' });
  }
});

// ─────────────────────────────────────────
// GET /api/chat/history
// Returns recent chat history for the logged-in user
// Query: ?matchId=xxx (optional)
// ─────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const { matchId } = req.query;
    const query = { userId: req.user._id, matchId: matchId || null };
    const messages = await ChatMessage.find(query).sort({ createdAt: 1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

module.exports = router;
