const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT access token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );

      // Get user from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(403).json({
          success: false,
          error: 'Account is temporarily locked due to failed login attempts'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized - User not authenticated'
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

/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(); // No token, but that's okay
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isLocked) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid or expired, but we don't fail the request
      console.log('Optional auth token invalid:', error.message);
    }

    next();
  } catch (error) {
    next(); // Continue even if there's an error
  }
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
      );

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token type'
        });
      }

      // Get user and check if refresh token exists
      const user = await User.findOne({
        _id: decoded.id,
        'refreshTokens.token': refreshToken
      }).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      req.user = user;
      req.refreshToken = refreshToken;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error during token verification'
    });
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  verifyRefreshToken
};
