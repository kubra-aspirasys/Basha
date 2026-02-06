const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./utils/errorHandler');

// Load env vars
dotenv.config();

// Import DB
const db = require('./models');

// Initialize App
const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static folder for uploads if needed
app.use('/uploads', express.static('uploads'));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Basha Biryani Backend API', status: 'running' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes')); // Existing profile routes
app.use('/api/cms', require('./routes/cmsRoutes')); // New CMS routes
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/customer/orders', require('./routes/customerOrderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Error Handling Middleware (Centralized)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

// Sync database and start server
db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = app;
