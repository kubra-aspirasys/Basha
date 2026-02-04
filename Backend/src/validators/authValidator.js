'use strict';
const { body } = require('express-validator');

const registerValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginValidator = [
    // Allow email or phone
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
    body('email').isEmail().withMessage('Valid email is required'),
];

const resetPasswordValidator = [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const updateProfileValidator = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('address').optional().isString(),
    body('avatar_url').optional().isString(),
    // Prevent sensitive fields
    body('role').custom((value, { req }) => {
        if (req.body.role !== undefined) {
            throw new Error('Role cannot be updated');
        }
        return true;
    }),
    body('permissions').custom((value, { req }) => {
        if (req.body.permissions !== undefined) {
            throw new Error('Permissions cannot be updated');
        }
        return true;
    }),
];

module.exports = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    updateProfileValidator
};
