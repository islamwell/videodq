require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');

// Import routes
const videoRoutes = require('./routes/videoRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const authRoutes = require('./routes/auth');
const userActivityRoutes = require('./routes/userActivity');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');

// Import security middleware
const {
  apiLimiter,
  configureHelmet,
  configureMongoSanitize,
  sanitizeInput,
  getCorsOptions
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(configureHelmet()); // Security headers
app.use(cors(getCorsOptions())); // CORS with configuration
app.use(configureMongoSanitize()); // Prevent NoSQL injection

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Parse cookies

// Sanitize user input
app.use(sanitizeInput);

// Apply general rate limiting to all routes
app.use('/api/', apiLimiter);

// Serve static uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/user', userActivityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'VideoDQ API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   VideoDQ API Server                                   ║
║   Port: ${PORT.toString().padEnd(43)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(39)}║
║   Status: ✓ Running                                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
