const mongoose = require('mongoose');

/**
 * Schema for video comments
 */
const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  // Moderation
  isReported: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  reports: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ videoId: 1, createdAt: -1 });
commentSchema.index({ videoId: 1, parentId: 1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ isDeleted: 1, isHidden: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count (will need to be populated separately)
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId',
  count: true
});

// Don't return deleted comments' content
commentSchema.methods.toJSON = function() {
  const comment = this.toObject({ virtuals: true });

  if (comment.isDeleted) {
    comment.content = '[Comment deleted]';
    delete comment.userId;
  }

  // Don't expose reports to regular users
  delete comment.reports;
  delete comment.isReported;

  return comment;
};

module.exports = mongoose.model('Comment', commentSchema);
