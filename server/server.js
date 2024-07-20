// server.js
require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL; 

mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
