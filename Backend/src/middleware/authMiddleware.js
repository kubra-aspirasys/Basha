'use strict';
const jwt = require('jsonwebtoken');

/**
 * Protect middleware to verify JWT token
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authorization token required'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'basha_biryani_secret_key_2024');
        req.user = decoded; // Contains { userId, role }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Shorthand for admin role check (Compatibility with existing routes)
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
    }
};

module.exports = { protect, admin };
