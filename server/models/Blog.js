const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  excerpt: { type: String, required: true },
  tags: [{ type: String }],
  date: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
});

BlogSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);