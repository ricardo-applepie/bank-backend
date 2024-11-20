// sequelize.js
const { Sequelize } = require('sequelize');  // Ensure Sequelize is imported
const config = require('./config');

const environment = 'development'; // Change this if using a different environment
const dbConfig = config[environment];

const sequelize = new Sequelize(`postgresql://neondb_owner:sPEWgAUO8HQ4@ep-dry-wave-a5wmgehc.us-east-2.aws.neon.tech/bank_app?sslmode=require`, {
  dialect: dbConfig.dialect,
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
