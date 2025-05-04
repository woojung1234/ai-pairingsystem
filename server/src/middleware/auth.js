const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes
 * Verifies the JWT token and adds the user ID to the request object
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
      
      // Add user to request object
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * Admin 권한 확인 미들웨어
 * role이 'admin'인 경우에만 접근 허용
 */
exports.adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin role required to access this route'
    });
  }
  
  next();
};

/**
 * Middleware to restrict access to specific roles
 * @param {String[]} roles - Array of roles that can access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    next();
  };
};
