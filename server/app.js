const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { initializeReports } = require('./controllers/reportController');

const app = express();

// Connect to database
connectDB();
initializeReports();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());


// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Limit requests from same IP
const generalLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});

// More lenient rate limiter for report routes
const reportLimiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many report requests from this IP, please try again in an hour!'
});

app.use('/api', generalLimiter);
app.use('/api/reports', reportLimiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ... (previous code remains the same)

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/protected', protect, require('./routes/protectedRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/finances', require('./routes/financeRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// ... (rest of the code remains the same)

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Handle 404 errors
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
});

module.exports = app;