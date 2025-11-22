const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserActivity = require('../models/UserActivity');
const UserPlaylist = require('../models/UserPlaylist');
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/user/watch-history
 * @desc    Update watch progress for a video
 * @access  Private
 */
router.post(
  '/watch-history',
  protect,
  [
    body('videoId').isMongoId().withMessage('Invalid video ID'),
    body('currentTime').isNumeric().withMessage('Current time must be a number'),
    body('duration').optional().isNumeric().withMessage('Duration must be a number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { videoId, currentTime, duration } = req.body;

      // Check if video exists
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ success: false, error: 'Video not found' });
      }

      // Find or create activity
      let activity = await UserActivity.findOne({
        userId: req.user._id,
        videoId
      });

      if (activity) {
        // Update existing activity
        activity.watchProgress.currentTime = currentTime;
        if (duration) activity.watchProgress.duration = duration;
        activity.lastWatched = Date.now();
        activity.watchCount += 1;
      } else {
        // Create new activity
        activity = new UserActivity({
          userId: req.user._id,
          videoId,
          watchProgress: {
            currentTime,
            duration: duration || video.duration || 0
          }
        });
      }

      await activity.save();

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Watch history error:', error);
      res.status(500).json({ success: false, error: 'Error updating watch history' });
    }
  }
);

/**
 * @route   GET /api/user/watch-history
 * @desc    Get user's watch history
 * @access  Private
 */
router.get('/watch-history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await UserActivity.find({ userId: req.user._id })
      .populate('videoId')
      .sort({ lastWatched: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserActivity.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({ success: false, error: 'Error fetching watch history' });
  }
});

/**
 * @route   GET /api/user/continue-watching
 * @desc    Get videos user is currently watching (incomplete)
 * @access  Private
 */
router.get('/continue-watching', protect, async (req, res) => {
  try {
    const activities = await UserActivity.find({
      userId: req.user._id,
      'watchProgress.completed': false,
      'watchProgress.percentComplete': { $gt: 0, $lt: 90 }
    })
      .populate('videoId')
      .sort({ lastWatched: -1 })
      .limit(10);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get continue watching error:', error);
    res.status(500).json({ success: false, error: 'Error fetching continue watching' });
  }
});

/**
 * @route   POST /api/user/favorites/:videoId
 * @desc    Add video to favorites
 * @access  Private
 */
router.post('/favorites/:videoId', protect, async (req, res) => {
  try {
    const { videoId } = req.params;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Find or create activity
    let activity = await UserActivity.findOne({
      userId: req.user._id,
      videoId
    });

    if (activity) {
      activity.isFavorite = true;
    } else {
      activity = new UserActivity({
        userId: req.user._id,
        videoId,
        isFavorite: true
      });
    }

    await activity.save();

    res.json({
      success: true,
      data: activity,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Error adding to favorites' });
  }
});

/**
 * @route   DELETE /api/user/favorites/:videoId
 * @desc    Remove video from favorites
 * @access  Private
 */
router.delete('/favorites/:videoId', protect, async (req, res) => {
  try {
    const { videoId } = req.params;

    const activity = await UserActivity.findOne({
      userId: req.user._id,
      videoId
    });

    if (!activity) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    activity.isFavorite = false;
    await activity.save();

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Error removing from favorites' });
  }
});

/**
 * @route   GET /api/user/favorites
 * @desc    Get user's favorite videos
 * @access  Private
 */
router.get('/favorites', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const favorites = await UserActivity.find({
      userId: req.user._id,
      isFavorite: true
    })
      .populate('videoId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserActivity.countDocuments({
      userId: req.user._id,
      isFavorite: true
    });

    res.json({
      success: true,
      data: favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Error fetching favorites' });
  }
});

/**
 * @route   POST /api/user/playlists
 * @desc    Create a new playlist
 * @access  Private
 */
router.post(
  '/playlists',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Playlist title is required'),
    body('description').optional().trim(),
    body('isPublic').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, description, isPublic } = req.body;

      const playlist = await UserPlaylist.create({
        userId: req.user._id,
        title,
        description,
        isPublic: isPublic || false
      });

      res.status(201).json({
        success: true,
        data: playlist,
        message: 'Playlist created successfully'
      });
    } catch (error) {
      console.error('Create playlist error:', error);
      res.status(500).json({ success: false, error: 'Error creating playlist' });
    }
  }
);

/**
 * @route   GET /api/user/playlists
 * @desc    Get user's playlists
 * @access  Private
 */
router.get('/playlists', protect, async (req, res) => {
  try {
    const playlists = await UserPlaylist.find({ userId: req.user._id })
      .populate('videos.videoId')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: playlists
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ success: false, error: 'Error fetching playlists' });
  }
});

/**
 * @route   GET /api/user/playlists/:id
 * @desc    Get a specific playlist
 * @access  Private
 */
router.get('/playlists/:id', protect, async (req, res) => {
  try {
    const playlist = await UserPlaylist.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('videos.videoId');

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ success: false, error: 'Error fetching playlist' });
  }
});

/**
 * @route   PUT /api/user/playlists/:id
 * @desc    Update playlist
 * @access  Private
 */
router.put('/playlists/:id', protect, async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const playlist = await UserPlaylist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    res.json({
      success: true,
      data: playlist,
      message: 'Playlist updated successfully'
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ success: false, error: 'Error updating playlist' });
  }
});

/**
 * @route   DELETE /api/user/playlists/:id
 * @desc    Delete playlist
 * @access  Private
 */
router.delete('/playlists/:id', protect, async (req, res) => {
  try {
    const playlist = await UserPlaylist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ success: false, error: 'Error deleting playlist' });
  }
});

/**
 * @route   POST /api/user/playlists/:id/videos
 * @desc    Add video to playlist
 * @access  Private
 */
router.post('/playlists/:id/videos', protect, async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Video ID is required' });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const playlist = await UserPlaylist.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    // Check if video already in playlist
    const exists = playlist.videos.some(v => v.videoId.toString() === videoId);
    if (exists) {
      return res.status(400).json({ success: false, error: 'Video already in playlist' });
    }

    playlist.videos.push({
      videoId,
      order: playlist.videos.length
    });

    await playlist.save();

    res.json({
      success: true,
      data: playlist,
      message: 'Video added to playlist'
    });
  } catch (error) {
    console.error('Add video to playlist error:', error);
    res.status(500).json({ success: false, error: 'Error adding video to playlist' });
  }
});

/**
 * @route   DELETE /api/user/playlists/:id/videos/:videoId
 * @desc    Remove video from playlist
 * @access  Private
 */
router.delete('/playlists/:id/videos/:videoId', protect, async (req, res) => {
  try {
    const { id, videoId } = req.params;

    const playlist = await UserPlaylist.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }

    playlist.videos = playlist.videos.filter(v => v.videoId.toString() !== videoId);
    await playlist.save();

    res.json({
      success: true,
      message: 'Video removed from playlist'
    });
  } catch (error) {
    console.error('Remove video from playlist error:', error);
    res.status(500).json({ success: false, error: 'Error removing video from playlist' });
  }
});

module.exports = router;
