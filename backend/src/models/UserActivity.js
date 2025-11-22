const mongoose = require('mongoose');

/**
 * Schema for tracking user video activities
 * Includes watch history, favorites, and progress tracking
 */
const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true
  },
  // Watch progress
  watchProgress: {
    currentTime: {
      type: Number,
      default: 0,
      min: 0
    },
    duration: {
      type: Number,
      default: 0,
      min: 0
    },
    percentComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  // User actions
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  // Timestamps
  lastWatched: {
    type: Date,
    default: Date.now
  },
  firstWatched: {
    type: Date,
    default: Date.now
  },
  watchCount: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
userActivitySchema.index({ userId: 1, videoId: 1 }, { unique: true });
userActivitySchema.index({ userId: 1, isFavorite: 1 });
userActivitySchema.index({ userId: 1, lastWatched: -1 });
userActivitySchema.index({ userId: 1, 'watchProgress.completed': 1 });

// Update percent complete before saving
userActivitySchema.pre('save', function(next) {
  if (this.watchProgress.duration > 0) {
    const percent = (this.watchProgress.currentTime / this.watchProgress.duration) * 100;
    this.watchProgress.percentComplete = Math.min(Math.round(percent), 100);

    // Mark as completed if watched > 90%
    if (this.watchProgress.percentComplete >= 90) {
      this.watchProgress.completed = true;
    }
  }
  next();
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
