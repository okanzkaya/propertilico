const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

const modelDefiners = [
  require('../models/User'),
  require('../models/Blog'),
  // Add other model definers here
];

// Initialize models
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// Run `.associate` if it exists,
// i.e. create relationships in the ORM
Object.values(sequelize.models)
  .filter(model => typeof model.associate === "function")
  .forEach(model => model.associate(sequelize.models));

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
    
    // In development, you might want to use { force: true } to drop and recreate all tables
    // In production, use { alter: true } to make safe changes to the database schema
    if (process.env.NODE_ENV === 'developmentd') {
      await sequelize.sync({ force: true });
      console.log('All tables dropped and recreated.');
    } else {
      await sequelize.sync({ alter: true });
      console.log('Database schema updated.');
    }
    
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, ...sequelize.models };