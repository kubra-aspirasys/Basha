'use strict';
const addressService = require('../services/addressService');

class AddressController {
    async listAddresses(req, res) {
        try {
            const addresses = await addressService.getAllAddresses(req.user.userId);
            res.status(200).json({ success: true, data: addresses });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async addAddress(req, res) {
        try {
            const address = await addressService.addAddress(req.user.userId, req.body);
            res.status(201).json({ success: true, message: 'Address added successfully', data: address });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateAddress(req, res) {
        try {
            const address = await addressService.updateAddress(req.user.userId, req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Address updated successfully', data: address });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteAddress(req, res) {
        try {
            const result = await addressService.deleteAddress(req.user.userId, req.params.id);
            res.status(200).json({ success: true, message: 'Address deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async setDefault(req, res) {
        try {
            const address = await addressService.setDefaultAddress(req.user.userId, req.params.id);
            res.status(200).json({ success: true, message: 'Address set as default successfully', data: address });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AddressController();
