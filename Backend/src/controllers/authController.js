'use strict';
const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/apiResponse');

class AuthController {
    async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        try {
            const data = await authService.register(req.body);
            return successResponse(res, 'Account created successfully', data, 201);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        try {
            const { email, phone, password, role } = req.body;
            const data = await authService.login(email || phone, password, role);
            return successResponse(res, 'Login successful', data);
        } catch (error) {
            return errorResponse(res, error.message, 401);
        }
    }

    async getMe(req, res) {
        try {
            const { userId, role } = req.user;
            const data = await authService.getMe(userId, role);
            return successResponse(res, 'User profile fetched successfully', data);
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    }

    async updateProfile(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        try {
            const { userId, role } = req.user;
            const data = await authService.updateProfile(userId, role, req.body);
            return successResponse(res, 'Profile updated successfully', data);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    async forgotPassword(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        try {
            const result = await authService.forgotPassword(req.body.email);
            return successResponse(res, result.message);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }

    async resetPassword(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            return successResponse(res, result.message);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new AuthController();
