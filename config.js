require('dotenv').config();

// config.js
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

module.exports = {
  development: {
    username: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    host: PGHOST,
    dialect: PGUSER,
  },
};
