// createDatabase.js
const { Sequelize } = require('sequelize');
const config = require('./config');

const environment = 'development'; // Change this if using a different environment
const dbConfig = config[environment];

// Connect to the default postgres database
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: true, // This ensures SSL is required
      rejectUnauthorized: false, // Depending on your environment, you may need to set this to true or false
    },
  },
});

const createDatabase = async () => {
  try {
    // Authenticate to the existing postgres database
    await sequelize.authenticate();
    console.log('Connection to postgres has been established successfully.');

    // Create the new bank_app database
    await sequelize.query(`CREATE DATABASE "bank_app";`);
    console.log('Database bank_app created successfully.');
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await sequelize.close();
  }
};

createDatabase();
