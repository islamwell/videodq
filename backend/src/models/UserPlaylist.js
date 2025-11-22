const mongoose = require('mongoose');

/**
 * Schema for user-created playlists
 */
const userPlaylistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Playlist title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  videos: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  thumbnail: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  stats: {
    totalDuration: {
      type: Number,
      default: 0
    },
    videoCount: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
userPlaylistSchema.index({ userId: 1, createdAt: -1 });
userPlaylistSchema.index({ isPublic: 1, createdAt: -1 });
userPlaylistSchema.index({ tags: 1 });
userPlaylistSchema.index({ 'videos.videoId': 1 });

// Update stats before saving
userPlaylistSchema.pre('save', function(next) {
  this.stats.videoCount = this.videos.length;
  next();
});

// Virtual for slug
userPlaylistSchema.virtual('slug').get(function() {
  return `${this._id}`;
});

module.exports = mongoose.model('UserPlaylist', userPlaylistSchema);
