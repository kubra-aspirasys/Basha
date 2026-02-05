const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log
    }
);

const Order = require('./models/Order')(sequelize, DataTypes);
// We need to associate other models effectively if we want strict sync, 
// but for adding a column "alter: true" on just the Order model might be enough.
// However, proper way is to load all models.

const db = require('./models');

const syncOrder = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync only the Order model
        await db.Order.sync({ alter: true });

        console.log('Order model synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to sync Order model:', error);
        process.exit(1);
    }
};

syncOrder();
