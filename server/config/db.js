const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const models = {};

const modelFiles = fs.readdirSync(path.join(__dirname, '../models'))
  .filter(file => file.endsWith('.js'));

for (const file of modelFiles) {
  const model = require(path.join(__dirname, '../models', file))(sequelize, Sequelize.DataTypes);
  models[model.name] = model;
}

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced in development mode');
    } else {
      // In production, use migrations instead of auto-sync
      console.log('Skipping auto-sync in production. Use migrations to manage schema.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, models, connectDB };