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
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { initializeReports } = require('./controllers/reportController');

const app = express();

// Connect to database and initialize reports
connectDB();
initializeReports();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(compression());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.DB_URL,
    touchAfter: 24 * 3600 // time period in seconds
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict'
  }
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again after an hour'
});
app.use('/api/auth/login', authLimiter);

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', corsOptions.origin);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
const routes = {
  auth: require('./routes/authRoutes'),
  user: require('./routes/userRoutes'),
  feedback: require('./routes/feedbackRoutes'),
  blog: require('./routes/blogRoutes'),
  property: require('./routes/propertyRoutes'),
  ticket: require('./routes/ticketRoutes'),
  contact: require('./routes/contactRoutes'),
  document: require('./routes/documentRoutes'),
  finance: require('./routes/financeRoutes'),
  report: require('./routes/reportRoutes'),
  task: require('./routes/taskRoutes'),
};

app.use('/api/auth', routes.auth);
app.use('/api/user', protect, routes.user);
app.use('/api/feedback', protect, routes.feedback);
app.use('/api/blogs', routes.blog);
app.use('/api/properties', protect, routes.property);
app.use('/api/tickets', protect, routes.ticket);
app.use('/api/contacts', protect, routes.contact);
app.use('/api/documents', protect, routes.document);
app.use('/api/finances', protect, routes.finance);
app.use('/api/reports', protect, routes.report);
app.use('/api/tasks', protect, routes.task);

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

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;