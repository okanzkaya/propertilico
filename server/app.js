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
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sequelize } = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { initializeReports } = require('./controllers/reportController');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(compression());

// Updated CORS configuration
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
    'Origin'
  ],
  exposedHeaders: ['Content-Disposition', 'Content-Length']
}));

// Apply Helmet after CORS to avoid conflicts
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(xss());
app.use(hpp({ whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'] }));

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
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increase the limit for general requests
  message: 'Too many requests from this IP, please try again later.'
});

const previewLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Allow more requests per minute for previews
  message: 'Too many preview requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/documents/:id/download', previewLimiter);


// Routes
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

// Add the new tax routes
app.use('/api/taxes', limiter, protect, require('./routes/taxRoutes'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// Health check route
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client/build', 'index.html')));
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize reports
(async () => {
  try {
    await initializeReports();
    console.log('Reports initialized.');
  } catch (error) {
    console.error('Error initializing reports:', error);
  }
})();

module.exports = app;