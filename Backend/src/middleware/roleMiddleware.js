'use strict';

/**
 * Role-based access control middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission for this action.'
            });
        }
        next();
    };
};

module.exports = { authorize };
