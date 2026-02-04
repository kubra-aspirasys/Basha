'use strict';

/**
 * Standardized API success response
 */
const successResponse = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Standardized API error response
 */
const errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    successResponse,
    errorResponse
};
