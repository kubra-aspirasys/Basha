const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const errorHandler = require('./utils/errorHandler');

// Load env vars
dotenv.config();

// Import DB
const db = require('./models');

// Initialize App
const app = express();

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// 1. ROBUST STATIC MEDIA SERVING (Must be at the top)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', (req, res, next) => {
    // Debug logging for terminal
    console.log('--- IMAGE REQUEST RECEIVED ---');
    console.log('File Name:', req.url);
    next();
}, express.static(uploadsPath));

// Also serve uploads under /api/uploads so images work through the
// existing /api proxy in production (no separate /uploads proxy needed)
app.use('/api/uploads', express.static(uploadsPath));

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://basha.aspirasys.in',
    'http://basha.aspirasys.in',
    'https://www.basha.aspirasys.in',
    'http://www.bashafood.in',
    'https://www.bashafood.in',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        return callback(null, true); // Allow all for now to fix production images
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Basha Foods Backend API', status: 'running' });
});

app.post('/api/auth/test-login', (req, res) => {
    res.json({ message: 'Login endpoint reached' });
});

// Diagnostics Route
app.get('/api/diagnostics', (req, res) => {
    let isWritable = false;
    try {
        const testFile = path.join(uploadsPath, '.test_write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        isWritable = true;
    } catch (e) { isWritable = false; }
    
    res.json({
        port: process.env.PORT || 5009,
        uploadsPath,
        exists: fs.existsSync(uploadsPath),
        writable: isWritable,
        fileCount: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath).length : 0,
        content: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath).slice(0, 10) : []
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/admin/orders', require('./routes/adminOrderRoutes'));
app.use('/api/customer/orders', require('./routes/customerOrderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/addresses', require('./routes/customerAddressRoutes'));

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = parseInt(process.env.PORT || "5009", 10);

db.sequelize.authenticate()
    .then(async () => {
        console.log('Database connection has been established successfully.');
        // Ensure new models are created and altered
        await db.sequelize.sync();
        console.log('Database synced successfully.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = app;