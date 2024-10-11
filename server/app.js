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
const { connectDB, sequelize } = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { initializeReports } = require('./controllers/reportController');

const app = express();

(async () => {
  try {
    await connectDB();
    console.log('Database connected and synced.');
    await initializeReports();
    console.log('Reports initialized.');
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
})();


app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(compression());
app.use(helmet());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000', 
  credentials: true 
}));
app.use(xss());
app.use(hpp({ whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'] }));

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

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const blogLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP for blog routes, please try again later.'
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', blogLimiter, require('./routes/blogRoutes'));
app.use('/api/user', generalLimiter, protect, require('./routes/userRoutes'));
app.use('/api/feedback', generalLimiter, protect, require('./routes/feedbackRoutes'));
app.use('/api/properties', generalLimiter, protect, require('./routes/propertyRoutes'));
app.use('/api/tickets', generalLimiter, protect, require('./routes/ticketRoutes'));
app.use('/api/contacts', generalLimiter, protect, require('./routes/contactRoutes'));
app.use('/api/documents', generalLimiter, protect, require('./routes/documentRoutes'));
app.use('/api/finances', generalLimiter, protect, require('./routes/financeRoutes'));
app.use('/api/reports', generalLimiter, protect, require('./routes/reportRoutes'));
app.use('/api/tasks', generalLimiter, protect, require('./routes/taskRoutes'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build', 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;