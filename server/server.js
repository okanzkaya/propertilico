// server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});