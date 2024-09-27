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
  maxProperties: { type: Number, default: 10 },
  language: { type: String, default: 'en' },
  timeZone: { type: String, default: 'UTC' },
  currency: { type: String, default: 'USD' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  measurementUnit: { type: String, default: 'metric' },
  fontSize: { type: String, default: 'medium' },
  twoFactorAuth: { type: Boolean, default: false },
  loginAlerts: { type: Boolean, default: true },
  lastPasswordChange: { type: Date },
  lastEmailChange: { type: Date },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  inAppNotifications: { type: Boolean, default: true },
  avatar: { type: String },
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