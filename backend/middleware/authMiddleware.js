require('dotenv').config();              // 1) load env first
const jwt = require('jwt-simple');

const JWT_SECRET = process.env.JWT_SECRET|| 'your_secret_key';   // no fallback in prod
const API_KEY    = process.env.API_KEY || 'test';

// Middleware to authenticate
const authenticate = (req, res, next) => {
  try {
    // Allow x-api-key shortcut
    if (req.headers['x-api-key'] === API_KEY) return next();
    const authHeader = req.headers['authorization']; // Get Authorization header
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.substring(6).trim();
    }
  
    if (!token) {
      return res.status(403).json({ message: 'Access denied' });
    }
  
    const decoded = jwt.decode(token, JWT_SECRET); // with jwt-simple, this won’t check exp
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

// Role guard
const authorizeRole = (...requiredRoles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) return res.status(403).json({ message: 'Access denied: no role' });
  if (!requiredRoles.includes(role)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  return next();
};

module.exports = { authenticate, authorizeRole };
