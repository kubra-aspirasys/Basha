'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    updateProfileValidator
} = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

module.exports = router;
