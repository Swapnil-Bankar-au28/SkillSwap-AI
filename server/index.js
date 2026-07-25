// index.js — SkillSwap AI Express Server Entry Point

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

// ── Connect to MongoDB ───────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json()); // parse JSON request bodies

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/matches',   require('./routes/matches'));
app.use('/api/reports',   require('./routes/reports'));
app.use('/api/quiz',      require('./routes/quiz'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin',     require('./routes/admin'));

// ── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap AI server is running 🚀' });
});

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SkillSwap AI server running at http://localhost:${PORT}`);
});
