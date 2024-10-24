require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const compression = require('compression');
const session = require('express-session');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sequelize } = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { initializeReports } = require('./controllers/reportController');

const app = express();

// Create necessary directories if they don't exist
const createRequiredDirectories = () => {
  const dirs = ['uploads', 'uploads/blog-images', 'uploads/avatars'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createRequiredDirectories();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/blog-images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                 allowedTypes.test(file.mimetype.split('/')[1]);
  cb(isValid ? null : new Error('Only image files are allowed!'), isValid);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Basic middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control',
    'Pragma',
    'X-Requested-With',
    'Accept',
    'Origin',
    'expires'
  ],
  exposedHeaders: ['Content-Disposition', 'Content-Length']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(xss());
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Session configuration
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  }
}));
sessionStore.sync();

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiting setup
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

const limiter = createRateLimiter(15 * 60 * 1000, 500, 'Too many requests from this IP, please try again later.');
const previewLimiter = createRateLimiter(60 * 1000, 50, 'Too many preview requests, please try again later.');
const uploadLimiter = createRateLimiter(15 * 60 * 1000, 50, 'Too many upload requests, please try again later.');

// Image upload route
app.post('/api/uploads', protect, uploadLimiter, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ 
      status: 'error',
      message: 'No image file provided' 
    });
  }

  const imageUrl = `/uploads/blog-images/${req.file.filename}`;
  res.status(200).json({ 
    status: 'success',
    url: imageUrl 
  });
}, errorHandler);

// Static file serving configuration
const staticFileOptions = {
  setHeaders: (res, filepath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(filepath)) {
      res.set('Cache-Control', 'public, max-age=31536000');
      res.set('Pragma', 'public');
    }
  },
  maxAge: '1y',
  etag: true,
  lastModified: true
};

// Apply rate limiters and routes
app.use('/api/documents/:id/download', previewLimiter);
app.use('/api/auth', limiter, require('./routes/authRoutes'));
app.use('/api/user', limiter, protect, require('./routes/userRoutes'));
app.use('/api/feedback', limiter, protect, require('./routes/feedbackRoutes'));
app.use('/api/properties', limiter, protect, require('./routes/propertyRoutes'));
app.use('/api/tickets', limiter, protect, require('./routes/ticketRoutes'));
app.use('/api/contacts', limiter, protect, require('./routes/contactRoutes'));
app.use('/api/documents', limiter, protect, require('./routes/documentRoutes'));
app.use('/api/finances', limiter, protect, require('./routes/financeRoutes'));
app.use('/api/reports', limiter, protect, require('./routes/reportRoutes'));
app.use('/api/tasks', limiter, protect, require('./routes/taskRoutes'));
app.use('/api/blogs', limiter, require('./routes/blogRoutes'));
app.use('/api/taxes', limiter, protect, require('./routes/taxRoutes'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filepath) => {
    // Allow cross-origin access
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Cache control for images
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(filepath)) {
      res.set('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Health check route
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client/build', 'index.html')));
}

// Error handling for file uploads
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: error.code === 'LIMIT_FILE_SIZE' 
        ? 'File size is too large. Maximum size is 5MB'
        : error.message
    });
  }
  next(error);
});

// General error handling
app.use(notFound);
app.use(errorHandler);

// Initialize reports
(async () => {
  try {
    await initializeReports();
    console.log('Reports initialized successfully');
  } catch (error) {
    console.error('Error initializing reports:', error);
  }
})();

// Add diagnostic route for debugging image serving
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/check-image/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'uploads', req.params.filename);
    res.json({
      exists: fs.existsSync(filepath),
      stats: fs.existsSync(filepath) ? fs.statSync(filepath) : null,
      path: filepath
    });
  });
}

module.exports = app;