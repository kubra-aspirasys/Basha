'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
console.log('--- Auth Routes Loaded ---');
const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    updateProfileValidator
} = require('../validators/authValidator');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerValidator, authController.register);
router.post('/login', (req, res, next) => {
    console.log('--- POST /api/auth/login reached ---');
    console.log('Body:', req.body);
    next();
}, loginValidator, authController.login);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidator, authController.updateProfile);

module.exports = router;
