'use strict';
const profileService = require('../services/profileService');
const { validationResult } = require('express-validator');

class ProfileController {
    async getProfile(req, res) {
        try {
            const data = await profileService.getProfile(req.user.userId, req.user.role);
            res.status(200).json({
                success: true,
                message: 'Profile fetched successfully',
                data
            });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async updateProfile(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        try {
            const data = await profileService.updateProfile(req.user.userId, req.user.role, req.body);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async changePassword(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }

        try {
            const { currentPassword, newPassword } = req.body;
            const result = await profileService.changePassword(req.user.userId, req.user.role, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async uploadAvatar(req, res) {
        try {
            // Frontend sends either multipart or base64. 
            // Based on Profile.tsx, it's likely part of the updateProfile body or a separate field.
            const avatarData = req.body.avatar_url || req.body.image;
            if (!avatarData) {
                return res.status(400).json({ success: false, message: 'No image data provided' });
            }

            const data = await profileService.uploadAvatar(req.user.userId, req.user.role, avatarData);
            res.status(200).json({
                success: true,
                message: 'Profile image updated successfully',
                data
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProfileController();
