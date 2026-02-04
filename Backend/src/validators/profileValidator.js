const { body } = require('express-validator');

const updateProfileValidator = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('address').optional().isString(),
    body('avatar_url').optional().isString().withMessage('Avatar URL must be a string'),
];

const changePasswordValidator = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
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
