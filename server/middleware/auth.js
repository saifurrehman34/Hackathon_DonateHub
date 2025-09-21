const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is NGO
const ngoOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ngo') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. NGO role required.' });
  }
};

// Check if user is donor
const donorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'donor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Donor role required.' });
  }
};

module.exports = { protect, ngoOnly, donorOnly };

