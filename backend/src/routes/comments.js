const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Video = require('../models/Video');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('videoId').isMongoId().withMessage('Invalid video ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters'),
    body('parentId').optional().isMongoId().withMessage('Invalid parent comment ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { videoId, content, parentId } = req.body;

      // Check if video exists
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }

      // If replying to a comment, check if parent exists
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
          return res.status(404).json({ success: false, error: 'Parent comment not found' });
        }
      }

      const comment = await Comment.create({
        videoId,
        userId: req.user._id,
        content,
        parentId: parentId || null
      });

      // Populate user info
      await comment.populate('userId', 'username name avatar');

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment created successfully'
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ success: false, error: 'Error creating comment' });
    }
  }
);

/**
 * @route   GET /api/comments/video/:videoId
 * @desc    Get comments for a video
 * @access  Public
 */
router.get('/video/:videoId', optionalAuth, async (req, res) => {
  try {
    const { videoId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || 'newest'; // newest, oldest, popular

    // Build sort options
    let sort = {};
    if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (sortBy === 'popular') {
      sort = { 'likes.length': -1, createdAt: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      videoId,
      parentId: null,
      isDeleted: false,
      isHidden: false
    })
      .populate('userId', 'username name avatar')
      .populate('replyCount')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      videoId,
      parentId: null,
      isDeleted: false,
      isHidden: false
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, error: 'Error fetching comments' });
  }
});

/**
 * @route   GET /api/comments/:commentId/replies
 * @desc    Get replies to a comment
 * @access  Public
 */
router.get('/:commentId/replies', optionalAuth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({
      parentId: commentId,
      isDeleted: false,
      isHidden: false
    })
      .populate('userId', 'username name avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ success: false, error: 'Error fetching replies' });
  }
});

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const comment = await Comment.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isDeleted: false
      });

      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      comment.content = req.body.content;
      comment.isEdited = true;
      await comment.save();

      await comment.populate('userId', 'username name avatar');

      res.json({
        success: true,
        data: comment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ success: false, error: 'Error updating comment' });
    }
  }
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (soft delete)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    comment.isDeleted = true;
    comment.deletedAt = Date.now();
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, error: 'Error deleting comment' });
  }
});

/**
 * @route   POST /api/comments/:id/like
 * @desc    Like a comment
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    // Check if already liked
    const alreadyLiked = comment.likes.some(
      like => like.userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ success: false, error: 'Already liked this comment' });
    }

    comment.likes.push({ userId: req.user._id });
    await comment.save();

    res.json({
      success: true,
      data: { likeCount: comment.likes.length },
      message: 'Comment liked successfully'
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ success: false, error: 'Error liking comment' });
  }
});

/**
 * @route   DELETE /api/comments/:id/like
 * @desc    Unlike a comment
 * @access  Private
 */
router.delete('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    comment.likes = comment.likes.filter(
      like => like.userId.toString() !== req.user._id.toString()
    );

    await comment.save();

    res.json({
      success: true,
      data: { likeCount: comment.likes.length },
      message: 'Comment unliked successfully'
    });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ success: false, error: 'Error unliking comment' });
  }
});

/**
 * @route   POST /api/comments/:id/report
 * @desc    Report a comment
 * @access  Private
 */
router.post(
  '/:id/report',
  protect,
  [body('reason').trim().notEmpty().withMessage('Report reason is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return res.status(404).json({ success: false, error: 'Comment not found' });
      }

      // Check if already reported by this user
      const alreadyReported = comment.reports.some(
        report => report.userId.toString() === req.user._id.toString()
      );

      if (alreadyReported) {
        return res.status(400).json({ success: false, error: 'Already reported this comment' });
      }

      comment.reports.push({
        userId: req.user._id,
        reason: req.body.reason
      });

      comment.isReported = true;

      // Auto-hide if too many reports
      if (comment.reports.length >= 5) {
        comment.isHidden = true;
      }

      await comment.save();

      res.json({
        success: true,
        message: 'Comment reported successfully'
      });
    } catch (error) {
      console.error('Report comment error:', error);
      res.status(500).json({ success: false, error: 'Error reporting comment' });
    }
  }
);

/**
 * @route   GET /api/comments/reported
 * @desc    Get reported comments (Admin only)
 * @access  Private/Admin
 */
router.get('/reported', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const comments = await Comment.find({ isReported: true })
      .populate('userId', 'username name avatar')
      .populate('videoId', 'title')
      .sort({ 'reports.length': -1, createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get reported comments error:', error);
    res.status(500).json({ success: false, error: 'Error fetching reported comments' });
  }
});

module.exports = router;
