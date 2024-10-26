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

// Constants
const UPLOAD_DIRS = {
  root: 'uploads',
  feedbacks: 'uploads/feedbacks',
  blogs: 'uploads/blog-images',
  avatars: 'uploads/avatars',
  properties: 'uploads/properties'
};

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;

// Initialize Express app
const app = express();

// Directory initialization
const createRequiredDirectories = () => {
  Object.values(UPLOAD_DIRS).forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Multer configurations
const createStorage = (uploadPath) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, uploadPath)),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${uuidv4()}${ext}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const isValid = ALLOWED_IMAGE_TYPES.test(path.extname(file.originalname).toLowerCase()) &&
                 ALLOWED_IMAGE_TYPES.test(file.mimetype.split('/')[1]);
  cb(isValid ? null : new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed.'), isValid);
};
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, 'uploads/avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Check both mimetype and extension
    const filetypes = /jpeg|jpg|png/;
    const mimetypes = /image\/jpeg|image\/jpg|image\/png/;
    
    const mimetype = mimetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg formats are allowed'));
    }
  }
});
const createMulterUpload = (uploadPath) => multer({
  storage: createStorage(uploadPath),
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter
});

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  standardHeaders: true,
  legacyHeaders: false,
});

const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 500, 'Too many requests from this IP, please try again later.'),
  preview: createRateLimiter(60 * 1000, 50, 'Too many preview requests, please try again later.'),
  upload: createRateLimiter(15 * 60 * 1000, 50, 'Too many upload requests, please try again later.')
};

// Initialize directories and uploads
createRequiredDirectories();
const upload = createMulterUpload(UPLOAD_DIRS.blogs);

// Basic middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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

// Static file serving configuration
const staticFileOptions = {
  setHeaders: (res, filepath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (ALLOWED_IMAGE_TYPES.test(filepath)) {
      res.set('Cache-Control', 'public, max-age=31536000');
      res.set('Pragma', 'public');
    }
  },
  maxAge: '1y',
  etag: true,
  lastModified: true
};

// Image upload route
app.post('/api/uploads', protect, rateLimiters.upload, upload.single('image'), (req, res, next) => {
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

// Apply rate limiters and routes
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
app.use('/api/blogs', rateLimiters.general, require('./routes/blogRoutes'));
app.use('/api/taxes', rateLimiters.general, protect, require('./routes/taxRoutes'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filepath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    if (ALLOWED_IMAGE_TYPES.test(filepath)) {
      res.set('Cache-Control', 'public, max-age=31536000');
      res.set('Pragma', 'public');
    }
  }
}));

// Development routes
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/image/:filename', (req, res) => {
    const filepath = path.join(__dirname, UPLOAD_DIRS.blogs, req.params.filename);
    res.json({
      exists: fs.existsSync(filepath),
      stats: fs.existsSync(filepath) ? fs.statSync(filepath) : null,
      fullPath: filepath
    });
  });

  app.get('/debug/check-image/:filename', (req, res) => {
    const filepath = path.join(__dirname, UPLOAD_DIRS.root, req.params.filename);
    res.json({
      exists: fs.existsSync(filepath),
      stats: fs.existsSync(filepath) ? fs.statSync(filepath) : null,
      path: filepath
    });
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
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: error.code === 'LIMIT_FILE_SIZE' 
        ? `File size is too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB`
        : error.message,
      code: error.code
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

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

module.exports = app;