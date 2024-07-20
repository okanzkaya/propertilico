const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  author: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], required: true }
});

module.exports = mongoose.model('Blog', BlogSchema);
