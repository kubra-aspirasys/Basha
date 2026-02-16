'use strict';
const { User, Customer } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

class AuthService {
    /**
     * Get user profile by token data
     */
    async getMe(userId, role) {
        const Model = role === 'admin' ? User : Customer;
        const user = await Model.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const userData = user.toJSON();
        delete userData.password_hash;
        delete userData.reset_password_token;
        delete userData.reset_password_expires;

        return { ...userData, role };
    }

    /**
     * Update user profile with safety checks
     */
    async updateProfile(userId, role, updateData) {
        const Model = role === 'admin' ? User : Customer;
        const user = await Model.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Define safe fields for update
        const safeFields = ['name', 'phone', 'address', 'avatar_url'];
        const filteredData = {};

        safeFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });

        // Prevention of sensitive fields is handled by choosing ONLY safeFields
        await user.update(filteredData);

        const userData = user.toJSON();
        delete userData.password_hash;
        delete userData.reset_password_token;
        delete userData.reset_password_expires;

        return { ...userData, role };
    }

    async login(emailOrPhone, password, requestedRole) {
        let user;
        let role = requestedRole;

        if (role === 'admin') {
            user = await User.findOne({
                where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
            });
            // Fallback check: maybe they are on the wrong tab
            if (!user) {
                user = await Customer.findOne({
                    where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
                });
                if (user) role = 'customer';
            }
        } else if (role === 'customer') {
            user = await Customer.findOne({
                where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
            });
            // Fallback check: maybe they are on the wrong tab
            if (!user) {
                user = await User.findOne({
                    where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
                });
                if (user) role = 'admin';
            }
        } else {
            // General fallback search
            user = await User.findOne({
                where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
            });
            if (user) {
                role = 'admin';
            } else {
                user = await Customer.findOne({
                    where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
                });
                if (user) role = 'customer';
            }
        }

        if (!user) throw new Error('Invalid credentials');
        if (role === 'customer' && user.is_blocked) throw new Error('Account is blocked');

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { userId: user.id, role },
            process.env.JWT_SECRET || 'basha_biryani_secret_key_2024',
            { expiresIn: '24h' }
        );

        if (role === 'customer') {
            await user.update({ last_activity: new Date() });
        }

        const userData = user.toJSON();
        delete userData.password_hash;
        delete userData.reset_password_token;
        delete userData.reset_password_expires;

        return {
            token,
            user: { ...userData, role }
        };
    }

    async register(userData) {
        const { email, phone, password, name, address } = userData;

        const existingInUser = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
        const existingInCustomer = await Customer.findOne({ where: { [Op.or]: [{ email }, { phone }] } });

        if (existingInUser || existingInCustomer) {
            throw new Error('Email or phone already registered');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            name,
            email,
            phone,
            password_hash,
            address,
            is_active: true,
            is_blocked: false
        });

        const token = jwt.sign(
            { userId: customer.id, role: 'customer' },
            process.env.JWT_SECRET || 'basha_biryani_secret_key_2024',
            { expiresIn: '24h' }
        );

        const result = customer.toJSON();
        delete result.password_hash;

        return {
            token,
            user: { ...result, role: 'customer' }
        };
    }

    async forgotPassword(email) {
        let user = await User.findOne({ where: { email } });
        let role = 'admin';

        if (!user) {
            user = await Customer.findOne({ where: { email } });
            role = 'customer';
        }

        if (!user) throw new Error('User not found with this email');

        const token = uuidv4();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await user.update({
            reset_password_token: token,
            reset_password_expires: expires
        });

        // Construct reset link
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetLink = `${clientUrl}/reset-password?token=${token}`;

        // Send actual email
        const emailService = require('./emailService');
        await emailService.sendPasswordResetEmail(user.email, user.name || 'User', resetLink);

        console.log(`[MAIL SENT] Reset password link for ${role} (${email}): ${resetLink}`);

        return { message: 'Password reset instructions sent to your email' };
    }

    async resetPassword(token, newPassword) {
        let user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            user = await Customer.findOne({
                where: {
                    reset_password_token: token,
                    reset_password_expires: { [Op.gt]: new Date() }
                }
            });
        }

        if (!user) throw new Error('Invalid or expired reset token');

        const password_hash = await bcrypt.hash(newPassword, 10);

        await user.update({
            password_hash,
            reset_password_token: null,
            reset_password_expires: null
        });

        return { message: 'Password has been reset successfully' };
    }
}

module.exports = new AuthService();
