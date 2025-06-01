const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const authenticateToken = async (req, res, next) => {
  const token = req?.cookies?.token;
  const sessionId = req?.cookies?.sessionId;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Logged-in user
    } catch (err) {
      console.error('JWT error:', err.message);
      req.user = null;
    }
  } else {
    req.user = null; // Guest user
  }

  req.sessionId = sessionId || null; // Set sessionId for guest (or null if missing)

  next(); // Pass control to controller
};

module.exports = authenticateToken;
