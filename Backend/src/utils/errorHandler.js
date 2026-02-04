'use strict';
const { errorResponse } = require('./apiResponse');

/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
