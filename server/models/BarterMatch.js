// models/BarterMatch.js
// Represents a barter agreement between 2 or more users

const mongoose = require('mongoose');

// A single session within a barter agreement
const sessionSchema = new mongoose.Schema({
  date:        { type: Date },
  duration:    { type: Number }, // in minutes
  format:      { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const barterMatchSchema = new mongoose.Schema(
  {
    // All users in this match (2 for direct, 3+ for chain)
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],

    matchType: {
      type: String,
      enum: ['direct', 'chain'],
      default: 'direct',
    },

    status: {
      type: String,
      enum: ['proposed', 'negotiating', 'agreed', 'completed', 'cancelled'],
      default: 'proposed',
    },

    // AI-generated plain-text summary of the agreed terms
    agreementText: { type: String, default: '' },

    // Who proposed the match
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Skill exchange summary (what each participant gives/gets)
    // e.g. [{ userId, gives: "Guitar lessons", gets: "Logo design" }]
    exchangeSummary: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        gives:  { type: String },
        gets:   { type: String },
      },
    ],

    sessions: [sessionSchema],

    // Unique Video Call Room ID for Jitsi live sessions
    videoRoomId: { type: String, default: '' },

    // AI-Generated 4-Week Session Roadmap / Checklist
    sessionRoadmap: [
      {
        week:       { type: Number },
        topic:      { type: String },
        activities: [{ type: String }],
        completed:  { type: Boolean, default: false },
      },
    ],

    // Ratings each participant gives after completion
    ratings: [
      {
        ratedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score:    { type: Number, min: 1, max: 5 },
        comment:  { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('BarterMatch', barterMatchSchema);
