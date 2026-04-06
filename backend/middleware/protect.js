const jwt = require('jsonwebtoken');

// This function runs before any protected route
// It checks if the user sent a valid token
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token must come as: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now req.user.id is available in all routes
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = protect;