// models/User.js
// Mongoose schema for a SkillSwap user

const mongoose = require('mongoose');

// Sub-schema for a skill a user is OFFERING
const skillOfferedSchema = new mongoose.Schema({
  skillName:   { type: String, required: true },
  category:    { type: String, default: 'General' }, // e.g. Music, Design, Tech
  proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
  description: { type: String, default: '' },
});

// Sub-schema for a skill a user WANTS to learn
const skillWantedSchema = new mongoose.Schema({
  skillName:   { type: String, required: true },
  category:    { type: String, default: 'General' },
  urgency:     { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  description: { type: String, default: '' },
});

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio:          { type: String, default: '' },
    location:     { type: String, default: '' },

    skillsOffered: [skillOfferedSchema],
    skillsWanted:  [skillWantedSchema],

    // Rolling average rating
    rating: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },

    // Achievement badges
    badges: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
