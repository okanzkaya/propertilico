const express = require('express');
const cors = require('cors'); // Import the cors package
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow your React frontend's origin
  credentials: true, // Enable credentials if you need cookies, authorization headers, etc.
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/protected', protectedRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
