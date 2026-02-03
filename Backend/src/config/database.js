const dotenv = require('dotenv');

// Load env vars
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'aspirfxc_basha',
    password: process.env.DB_PASSWORD || 'basha@12345',
    database: process.env.DB_NAME || 'aspirfxc_basha_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'aspirfxc_basha',
    password: process.env.DB_PASSWORD || 'basha@12345',
    database: process.env.DB_NAME_TEST || 'aspirfxc_basha_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER || 'aspirfxc_basha',
    password: process.env.DB_PASSWORD || 'basha@12345',
    database: process.env.DB_NAME || 'aspirfxc_basha_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
