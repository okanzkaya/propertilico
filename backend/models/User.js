const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { 
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [1, 50], msg: 'Name must be between 1 and 50 characters' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Please enter a valid email address' } }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [8, 100], msg: 'Password must be between 8 and 100 characters' } }
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    isAdmin: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    isBlogger: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    bloggerDescription: {
      type: DataTypes.STRING(500),
      defaultValue: "Property Management Expert"
    },
    avatar: DataTypes.STRING,
    adminId: { 
      type: DataTypes.STRING, 
      unique: true 
    },
    language: { 
      type: DataTypes.STRING, 
      defaultValue: 'en' 
    },
    timeZone: { 
      type: DataTypes.STRING, 
      defaultValue: 'UTC' 
    },
    currency: { 
      type: DataTypes.STRING, 
      defaultValue: 'USD' 
    },
    dateFormat: { 
      type: DataTypes.STRING, 
      defaultValue: 'MM/DD/YYYY' 
    },
    measurementUnit: { 
      type: DataTypes.STRING, 
      defaultValue: 'metric' 
    },
    fontSize: { 
      type: DataTypes.STRING, 
      defaultValue: 'medium' 
    },
    theme: { 
      type: DataTypes.STRING, 
      defaultValue: 'light' 
    },
    twoFactorAuth: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    loginAlerts: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    lastPasswordChange: DataTypes.DATE,
    lastEmailChange: DataTypes.DATE,
    emailNotifications: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    pushNotifications: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    inAppNotifications: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    loginAttempts: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },
    lockUntil: DataTypes.DATE,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpire: DataTypes.DATE,
    googleId: { 
      type: DataTypes.STRING, 
      unique: true 
    },
    notifications: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    lastLogin: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    role: {
      type: DataTypes.ENUM('user', 'blogger', 'admin'),
      defaultValue: 'user'
    },
    properties: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    maxProperties: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      allowNull: false
    }
  }, {
    tableName: 'users',
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['admin_id'] },
      { fields: ['google_id'] },
      { fields: ['status'] },
      { fields: ['role'] }
    ],
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
          user.lastPasswordChange = new Date();
        }
        if (user.changed('email')) {
          user.lastEmailChange = new Date();
        }
      }
    }
  });

  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  User.prototype.incrementLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
      this.loginAttempts = 1;
      this.lockUntil = null;
    } else {
      this.loginAttempts += 1;
      if (this.loginAttempts >= 5 && !this.lockUntil) {
        this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
    }
    await this.save();
  };

  User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  User.prototype.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.lockUntil = null;
    await this.save();
  };

  User.prototype.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
  };

  User.associate = (models) => {
    User.hasMany(models.Blog, { foreignKey: 'author_id', as: 'blogs' });
    User.hasMany(models.Property, { foreignKey: 'owner_id', as: 'ownedProperties' });
    User.hasMany(models.Contact, { foreignKey: 'user_id', as: 'contacts' });
    User.hasMany(models.Document, { foreignKey: 'user_id', as: 'documents' });
    User.hasMany(models.Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
    User.hasMany(models.Task, { foreignKey: 'user_id', as: 'tasks' });
    User.hasMany(models.Ticket, { foreignKey: 'creator_id', as: 'createdTickets' });
    User.hasMany(models.Ticket, { foreignKey: 'assignee_id', as: 'assignedTickets' });
    User.hasMany(models.Transaction, { foreignKey: 'user_id', as: 'transactions' });
    User.hasMany(models.Report, { foreignKey: 'user_id', as: 'reports' });

    // Add this new association for favorites
    User.belongsToMany(models.Property, {
      through: 'UserFavorites',
      as: 'favoriteProperties',
      foreignKey: 'userId'
    });
  };

  return User;
};