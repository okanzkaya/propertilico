const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

const models = {};

// Read all model files
const modelFiles = fs.readdirSync(path.join(__dirname, '../models'))
  .filter(file => file.endsWith('.js'));

// Import models
for (const file of modelFiles) {
  const model = require(path.join(__dirname, '../models', file))(sequelize, Sequelize.DataTypes);
  models[model.name] = model;
}

// Run associations if they exist
Object.values(models)
  .filter(model => typeof model.associate === "function")
  .forEach(model => model.associate(models));

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database schema updated.');
    } else {
      await sequelize.sync();
      console.log('Database synchronized.');
    }
    
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, models, connectDB };