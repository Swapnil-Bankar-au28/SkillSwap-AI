// models/Report.js
// Stores user-submitted reports about bad actors or problematic matches

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId:      { type: mongoose.Schema.Types.ObjectId, ref: 'BarterMatch', default: null },
    reason:       { type: String, required: true },
    status:       { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
