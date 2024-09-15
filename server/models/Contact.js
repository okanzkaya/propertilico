// server/models/Contact.js

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  customFields: [{
    key: String,
    value: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);