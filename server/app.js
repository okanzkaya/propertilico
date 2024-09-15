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
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const blogRoutes = require('./routes/blogRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { protect } = require('./middleware/authMiddleware');

const app = express();

// Connect to database
console.log('Connecting to database');
connectDB();

// Middleware
console.log('Adding express.json middleware');
app.use(express.json({ limit: '10kb' }));
console.log('Adding express.urlencoded middleware');
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
console.log('Adding cookie-parser middleware');
app.use(cookieParser());
console.log('Adding compression middleware');
app.use(compression());

// Security HTTP headers
console.log('Adding helmet middleware');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Adding morgan middleware for development logging');
  app.use(morgan('dev'));
}

// Limit requests from same IP
console.log('Adding rate limiter');
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
console.log('Adding mongoSanitize middleware');
app.use(mongoSanitize());

// Data sanitization against XSS
console.log('Adding xss middleware');
app.use(xss());

// Prevent parameter pollution
console.log('Adding hpp middleware');
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

// CORS configuration
console.log('Adding CORS middleware');
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files
console.log('Adding static file middleware for public folder');
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files for file attachments
console.log('Adding static file middleware for uploads');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
console.log('Adding auth routes');
app.use('/api/auth', authRoutes);

console.log('Adding protected routes');
app.use('/api/protected', protect, protectedRoutes);

console.log('Adding feedback routes');
app.use('/api/feedback', feedbackRoutes);

console.log('Adding blog routes');
app.use('/api/blogs', blogRoutes);

console.log('Adding property routes');
app.use('/api/properties', propertyRoutes);

console.log('Adding ticket routes');
app.use('/api/tickets', ticketRoutes);

console.log('Adding contact routes');
app.use('/api/contacts', contactRoutes);


// Health check route
console.log('Adding health check route');
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  console.log('Setting up production static files');
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  console.log('Setting up development root route');
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handling middleware
console.log('Adding error handling middleware');
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

module.exports = app;