const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import DB
const db = require('./models');

// Initialize App
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Basha Biryani Backend API', status: 'running' });
});

// Routes Placeholder
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/customer/orders', require('./routes/customerOrderRoutes'));
// app.use('/api/customers', require('./routes/customerRoutes'));
// app.use('/api/inquiries', require('./routes/inquiryRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

// Sync database and start server
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        // Only verify connection, don't sync automatically in production to avoid data loss
        // In dev, you might run migrations manually
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = app;
