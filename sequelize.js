// sequelize.js
const { Sequelize } = require('sequelize');  // Ensure Sequelize is imported
const config = require('./config');

const environment = 'development'; // Change this if using a different environment
const dbConfig = config[environment];

const sequelize = new Sequelize(`postgres://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?sslmode=require`, {
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
