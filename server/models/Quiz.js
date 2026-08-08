// models/Quiz.js
// Schema for AI-generated skill verification quizzes

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    index: true,
  },
  questions: [{
    questionText: { type: String, required: true },
    options:      [{ type: String, required: true }],
    correctIndex: { type: Number, required: true }, // 0, 1, 2, or 3
    explanation:  { type: String },
  }],
  generatedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Quizzes auto-expire after 1 hour
  },
});

module.exports = mongoose.model('Quiz', quizSchema);
