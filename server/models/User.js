const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  subscriptionEndDate: { 
    type: Date, 
    default: () => new Date(+new Date() + 30*24*60*60*1000), // 30 days from now
    set: function(value) {
      return value === null ? null : new Date(value);
    }
  },
  isAdmin: { type: Boolean, default: false },
  isBlogger: { type: Boolean, default: false },
  adminId: { type: String, unique: true, sparse: true },
  properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  language: { type: String, default: 'en' },
  timeZone: { type: String, default: 'UTC' },
  currency: { type: String, default: 'USD' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  measurementUnit: { type: String, default: 'metric' },
  fontSize: { type: String, default: 'medium' },
  theme: { type: String, default: 'light' },
  twoFactorAuth: { type: Boolean, default: false },
  loginAlerts: { type: Boolean, default: true },
  lastPasswordChange: { type: Date },
  lastEmailChange: { type: Date },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  inAppNotifications: { type: Boolean, default: true },
  avatar: { type: String },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  googleId: { type: String, unique: true, sparse: true },
  loginHistory: [{
    ip: String,
    userAgent: String,
    browser: String,
    os: String,
    device: String,
    country: String,
    city: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.subscriptionEndDate instanceof Date) {
      ret.subscriptionEndDate = ret.subscriptionEndDate.toISOString();
    } else {
      ret.subscriptionEndDate = null;
    }
    ret.isBlogger = doc.isBlogger;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.set('toObject', {
  transform: (doc, ret) => {
    if (ret.subscriptionEndDate instanceof Date) {
      ret.subscriptionEndDate = ret.subscriptionEndDate.toISOString();
    } else {
      ret.subscriptionEndDate = null;
    }
    ret.isBlogger = doc.isBlogger;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword || !this.password) {
    return false;
  }
  
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error in matchPassword:', error);
    return false;
  }
};

userSchema.methods.incrementLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }
  return this.updateOne(updates);
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);