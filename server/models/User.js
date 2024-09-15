const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionEndDate: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false },
  adminId: { type: String, unique: true, sparse: true },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  maxProperties: { type: Number, default: 10 }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);