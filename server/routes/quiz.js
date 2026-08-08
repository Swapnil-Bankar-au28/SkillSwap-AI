// routes/quiz.js
// Routes for AI skill verification quizzes

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateSkillQuiz } = require('../services/aiService');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/quiz/generate
// Body: { skillName }
// Generates or fetches a 5-question AI verification quiz
// ─────────────────────────────────────────
router.post('/generate', protect, async (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName) {
      return res.status(400).json({ message: 'skillName is required' });
    }

    // Generate fresh quiz using Gemini
    const quizData = await generateSkillQuiz(skillName);

    const quiz = await Quiz.create({
      skillName,
      questions: quizData.questions,
      generatedFor: req.user._id,
    });

    res.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
  }
});

// ─────────────────────────────────────────
// POST /api/quiz/submit
// Body: { quizId, answers: [0, 2, 1, 3, 0] }
// Evaluates answers; awards "Verified" badge if score >= 80%
// ─────────────────────────────────────────
router.post('/submit', protect, async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or expired' });
    }

    let correctCount = 0;
    const total = quiz.questions.length;

    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 80;

    let userUpdated = null;
    if (passed) {
      const user = await User.findById(req.user._id);
      if (!user.verifiedSkills.includes(quiz.skillName)) {
        user.verifiedSkills.push(quiz.skillName);
      }
      if (!user.badges.includes('Verified Expert')) {
        user.badges.push('Verified Expert');
      }
      await user.save();
      userUpdated = user;
    }

    res.json({
      passed,
      percentage,
      correctCount,
      total,
      skillName: quiz.skillName,
      user: userUpdated,
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Failed to evaluate quiz' });
  }
});

module.exports = router;
