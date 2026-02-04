'use strict';
const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect middleware to verify JWT token
 */
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Authorization token required', 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'basha_biryani_secret_key_2024');
        req.user = decoded; // Contains { userId, role }
        next();
    } catch (error) {
        return errorResponse(res, 'Invalid or expired token', 401);
    }
};

/**
 * Admin middleware shorthand
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return errorResponse(res, 'Access denied: Admin only', 403);
    }
};

module.exports = { protect, admin };
