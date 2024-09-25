// models/tables.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Ensure the path is correct

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Sync the model with the database
const syncModels = async () => {
  try {
    await sequelize.sync(); // This creates the table if it doesn't exist
    console.log('User table has been created (if it did not exist).');
  } catch (error) {
    console.error('Error syncing models:', error);
  } finally {
    // await sequelize.close(); // Close the connection
  }
};

syncModels();
module.exports = User