// models/ChatMessage.js
// Stores individual messages in a chat conversation (with or without a match)

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Optional: if the chat is within a specific match negotiation
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'BarterMatch', default: null },

    // 'user' = message from the logged-in user; 'assistant' = message from Claude AI
    role: { type: String, enum: ['user', 'assistant'], required: true },

    content: { type: String, required: true },

    // Any structured skill data the AI extracted from this message
    extractedSkills: {
      offered: [{ skillName: String, category: String, proficiency: String, description: String }],
      wanted:  [{ skillName: String, category: String, urgency: String, description: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
