// models/Document.js

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  category: {
    type: String,
    enum: ['document', 'image', 'video', 'other'],
    required: true
  },
  mimeType: {
    type: String
  },
  size: {
    type: Number,
    default: 0
  },
  content: {
    type: Buffer
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  path: {
    type: String,
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);