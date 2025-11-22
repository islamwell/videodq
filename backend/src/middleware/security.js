const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again after 15 minutes'
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    });
  }
});

/**
 * Rate limiter for password reset
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: {
    success: false,
    error: 'Too many password reset attempts'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many password reset attempts from this IP, please try again after an hour'
    });
  }
});

/**
 * Rate limiter for video uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: 'Too many upload attempts'
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Upload limit exceeded, please try again later'
    });
  }
});

/**
 * Configure helmet for security headers
 */
const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // For development
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'https://api.videodq.com'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https:', 'http:'],
        frameSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false, // Allow embedding videos from external sources
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });
};

/**
 * Configure mongo sanitize to prevent NoSQL injection
 */
const configureMongoSanitize = () => {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized potentially malicious input: ${key}`);
    }
  });
};

/**
 * Sanitize user input
 */
const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with $ or contain .
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * CORS configuration
 */
const getCorsOptions = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:19006'];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
};

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  configureHelmet,
  configureMongoSanitize,
  sanitizeInput,
  getCorsOptions
};
