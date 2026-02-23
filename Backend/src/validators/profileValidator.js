const { body } = require('express-validator');

const updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('phone')
        .optional()
        .trim()
        .notEmpty().withMessage('Phone cannot be empty')
        .matches(/^[0-9+\-\s()]*$/).withMessage('Invalid phone number format')
        .escape(),
    body('address').optional().trim().isString().escape(),
    body('avatar_url').optional().isString().withMessage('Avatar URL must be a string'),
];

const changePasswordValidator = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match new password');
        }
        return true;
    }),
];

module.exports = {
    updateProfileValidator,
    changePasswordValidator
};
