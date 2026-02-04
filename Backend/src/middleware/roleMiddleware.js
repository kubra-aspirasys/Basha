'use strict';
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to check if user has required role
 * @param {string|string[]} roles - Allowed role or roles
 */
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return errorResponse(res, 'Access denied: Unauthorized role', 403);
        }
        next();
    };
};

module.exports = { authorize };
