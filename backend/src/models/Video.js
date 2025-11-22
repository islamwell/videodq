const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  speaker: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  tags: [{
    type: String,
  }],
  views: {
    type: Number,
    default: 0,
  },
  // Storage information
  storageType: {
    type: String,
    enum: ['local', 's3', 'cloudinary', 'external'],
    default: 'external'
  },
  storageKey: {
    type: String,
    default: null
  },
  // Video quality variants (for adaptive streaming)
  qualities: [{
    resolution: String, // e.g., "1080p", "720p", "480p"
    url: String,
    bitrate: Number
  }],
  // Subtitles/Captions
  subtitles: [{
    language: String,
    url: String,
    label: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
videoSchema.index({ title: 'text', description: 'text', speaker: 'text' }); // Text search
videoSchema.index({ category: 1, createdAt: -1 }); // Category filtering
videoSchema.index({ tags: 1 }); // Tag filtering
videoSchema.index({ speaker: 1 }); // Speaker filtering
videoSchema.index({ views: -1 }); // Popular videos
videoSchema.index({ createdAt: -1 }); // Recent videos

videoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Video', videoSchema);
