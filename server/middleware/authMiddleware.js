// middleware/authMiddleware.js
// Verifies the JWT token on protected routes
// Usage: add as middleware to any route that requires authentication

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Expect token in the Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without passwordHash) to request
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized — invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }
};

module.exports = { protect };
