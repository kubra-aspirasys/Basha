'use strict';
const { User, Customer } = require('../models');
const bcrypt = require('bcryptjs');

class ProfileService {
    async getProfile(userId, role) {
        let user;
        if (role === 'admin') {
            user = await User.findByPk(userId);
        } else {
            user = await Customer.findByPk(userId);
        }

        if (!user) {
            throw new Error('User not found');
        }

        const userData = user.toJSON();
        delete userData.password_hash;
        delete userData.reset_password_token;
        delete userData.reset_password_expires;

        return { ...userData, role };
    }

    async updateProfile(userId, role, updateData) {
        let user;
        if (role === 'admin') {
            user = await User.findByPk(userId);
        } else {
            user = await Customer.findByPk(userId);
        }

        if (!user) {
            throw new Error('User not found');
        }

        // Only allow update of safe fields based on UI
        const safeFields = ['name', 'phone', 'avatar_url', 'address'];
        const dataToUpdate = {};

        Object.keys(updateData).forEach(key => {
            if (safeFields.includes(key)) {
                dataToUpdate[key] = updateData[key];
            }
        });

        await user.update(dataToUpdate);

        const userData = user.toJSON();
        delete userData.password_hash;
        delete userData.reset_password_token;
        delete userData.reset_password_expires;

        return { ...userData, role };
    }

    async changePassword(userId, role, currentPassword, newPassword) {
        let user;
        if (role === 'admin') {
            user = await User.findByPk(userId);
        } else {
            user = await Customer.findByPk(userId);
        }

        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            throw new Error('Incorrect current password');
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        await user.update({ password_hash });

        return { message: 'Password changed successfully' };
    }

    async uploadAvatar(userId, role, avatarData) {
        // Since project doesn't have a storage system yet, we assume avatarData is a URL or Base64 string
        // passed from frontend, which we store in the avatar_url field.
        return this.updateProfile(userId, role, { avatar_url: avatarData });
    }
}

module.exports = new ProfileService();
