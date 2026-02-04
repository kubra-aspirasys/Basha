'use strict';
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
    async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        try {
            const data = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        try {
            const { email, phone, password, role } = req.body;
            const data = await authService.login(email || phone, password, role);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data
            });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }

    async forgotPassword(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        try {
            const result = await authService.forgotPassword(req.body.email);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();
