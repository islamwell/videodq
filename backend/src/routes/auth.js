const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, verifyRefreshToken } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/security');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-z0-9_]+$/)
      .withMessage('Username can only contain lowercase letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { username, email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken'
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        name
      });

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Save refresh token
      user.refreshTokens.push({ token: refreshToken });
      await user.save();

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: user.toJSON(),
          accessToken
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Error registering user'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user and include password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(403).json({
          success: false,
          error: 'Account is temporarily locked due to failed login attempts. Please try again later.'
        });
      }

      // Check password
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        // Increment login attempts
        await user.incLoginAttempts();

        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // Save refresh token
      user.refreshTokens.push({ token: refreshToken });
      await user.save();

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          accessToken
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Error logging in'
      });
    }
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', verifyRefreshToken, async (req, res) => {
  try {
    const user = req.user;

    // Generate new access token
    const accessToken = user.generateAccessToken();

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Error refreshing token'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', protect, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token from database
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging out'
    });
  }
});

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', protect, async (req, res) => {
  try {
    // Remove all refresh tokens
    await User.updateOne(
      { _id: req.user._id },
      { $set: { refreshTokens: [] } }
    );

    // Clear cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging out from all devices'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting user data'
    });
  }
});

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/update-profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('preferences.language')
      .optional()
      .isIn(['en', 'ar', 'ur', 'id'])
      .withMessage('Invalid language'),
    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('Invalid theme')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const allowedUpdates = ['name', 'preferences'];
      const updates = {};

      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating profile'
      });
    }
  }
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      // Verify current password
      const isPasswordCorrect = await user.comparePassword(currentPassword);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Invalidate all refresh tokens for security
      user.refreshTokens = [];
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Error changing password'
      });
    }
  }
);

module.exports = router;
