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
const fs = require('fs').promises;
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sequelize } = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { initializeReports } = require('./controllers/reportController');

// Constants
const UPLOAD_DIRS = {
  root: 'uploads',
  feedbacks: 'uploads/feedbacks',
  blogs: 'uploads/blog-images',
  avatars: 'uploads/avatars',
  properties: 'uploads/properties',
  public: 'public'
};

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;

// Initialize Express app
const app = express();

// Directory initialization with error handling
const createRequiredDirectories = async () => {
  try {
    await Promise.all(
      Object.values(UPLOAD_DIRS).map(async (dir) => {
        const dirPath = path.join(__dirname, dir);
        try {
          await fs.access(dirPath);
        } catch {
          await fs.mkdir(dirPath, { recursive: true });
          await fs.chmod(dirPath, 0o755); // Set proper permissions
        }
      })
    );
    console.log('All directories initialized successfully');
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
};

// Enhanced Multer configurations
const createStorage = (uploadPath) => multer.diskStorage({
  destination: async (req, file, cb) => {
    const fullPath = path.join(__dirname, uploadPath);
    try {
      await fs.access(fullPath);
      cb(null, fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${path.parse(file.originalname).name}-${uniqueId}${ext}`;
    cb(null, filename);
  }
});

// Blog image storage configuration
const blogStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, UPLOAD_DIRS.blogs);
    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `blog-${uniqueSuffix}${ext}`);
  }
});

// Enhanced file filter
const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();
  
  const isValidMime = ALLOWED_IMAGE_TYPES.test(mimeType.split('/')[1]);
  const isValidExt = ALLOWED_IMAGE_TYPES.test(ext.substring(1));
  
  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed.'), false);
  }
};

// Configure uploads with size limits and validation
const configureUpload = (storage, options = {}) => multer({
  storage,
  limits: {
    fileSize: options.fileSize || FILE_SIZE_LIMIT,
    files: options.files || 1
  },
  fileFilter
});

const upload = configureUpload(blogStorage);

// Basic middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Enhanced security configuration
const corsOptions = {
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
};

app.use(cors(corsOptions));

// Configure Helmet with necessary adjustments for image serving
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', '*'],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000'],
    }
  }
}));

app.use(xss());
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Session configuration
const sessionStore = new SequelizeStore({ db: sequelize });
const sessionConfig = {
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
};

app.use(session(sessionConfig));
sessionStore.sync();

// Logging configuration
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Enhanced static file serving
const staticFileOptions = {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    if (ALLOWED_IMAGE_TYPES.test(path.extname(filepath))) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Pragma', 'public');
    }
  }
};

// Serve static files with proper configuration
app.use('/public', express.static(path.join(__dirname, 'public'), staticFileOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticFileOptions));

// Rate limiting
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 500),
  preview: createRateLimiter(60 * 1000, 50),
  upload: createRateLimiter(15 * 60 * 1000, 50)
};

// Initialize directories
(async () => {
  try {
    await createRequiredDirectories();
    console.log('Directories initialized successfully');
  } catch (error) {
    console.error('Failed to initialize directories:', error);
    process.exit(1);
  }
})();

// Enhanced image upload route with better error handling
app.post('/api/uploads', protect, rateLimiters.upload, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/blog-images/${req.file.filename}`;
    
    // Verify file was saved
    await fs.access(path.join(__dirname, 'uploads/blog-images', req.file.filename));
    
    res.status(200).json({
      status: 'success',
      url: imageUrl
    });
  } catch (error) {
    next(error);
  }
});

// Apply routes with rate limiting
app.use('/api/documents/:id/download', rateLimiters.preview);
app.use('/api/auth', rateLimiters.general, require('./routes/authRoutes'));
app.use('/api/user', rateLimiters.general, protect, require('./routes/userRoutes'));
app.use('/api/feedback', rateLimiters.general, protect, require('./routes/feedbackRoutes'));
app.use('/api/properties', rateLimiters.general, protect, require('./routes/propertyRoutes'));
app.use('/api/tickets', rateLimiters.general, protect, require('./routes/ticketRoutes'));
app.use('/api/contacts', rateLimiters.general, protect, require('./routes/contactRoutes'));
app.use('/api/documents', rateLimiters.general, protect, require('./routes/documentRoutes'));
app.use('/api/finances', rateLimiters.general, protect, require('./routes/financeRoutes'));
app.use('/api/reports', rateLimiters.general, protect, require('./routes/reportRoutes'));
app.use('/api/tasks', rateLimiters.general, protect, require('./routes/taskRoutes'));
app.use('/api', rateLimiters.general, require('./routes/blogRoutes'));
app.use('/api/taxes', rateLimiters.general, protect, require('./routes/taxRoutes'));

// Development routes for debugging
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/image/:filename', async (req, res) => {
    const filepath = path.join(__dirname, UPLOAD_DIRS.blogs, req.params.filename);
    try {
      const stats = await fs.stat(filepath);
      res.json({
        exists: true,
        stats,
        fullPath: filepath,
        url: `/uploads/blog-images/${req.params.filename}`
      });
    } catch (error) {
      res.json({
        exists: false,
        error: error.message,
        fullPath: filepath
      });
    }
  });

  app.get('/debug/directories', async (req, res) => {
    const dirs = {};
    for (const [key, dir] of Object.entries(UPLOAD_DIRS)) {
      const fullPath = path.join(__dirname, dir);
      try {
        const stats = await fs.stat(fullPath);
        dirs[key] = {
          exists: true,
          path: fullPath,
          stats: {
            mode: stats.mode,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          }
        };
      } catch (error) {
        dirs[key] = {
          exists: false,
          path: fullPath,
          error: error.message
        };
      }
    }
    res.json(dirs);
  });
}

// Health check route
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Production setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client/build', 'index.html')));
}

// Enhanced error handling
app.use((error, req, res, next) => {
  console.error('Application error:', error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: error.code === 'LIMIT_FILE_SIZE'
        ? `File size is too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`
        : error.message,
      code: error.code
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }

  next(error);
});

// Initialize error handlers
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

// Error handling for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

module.exports = app;