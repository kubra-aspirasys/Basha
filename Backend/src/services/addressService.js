'use strict';
const { CustomerAddress } = require('../models');

class AddressService {
    async getAllAddresses(customerId) {
        return await CustomerAddress.findAll({
            where: { customer_id: customerId },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
    }

    async addAddress(customerId, addressData) {
        // If this is set to default, unset others first
        if (addressData.is_default) {
            await CustomerAddress.update(
                { is_default: false },
                { where: { customer_id: customerId } }
            );
        }

        return await CustomerAddress.create({
            ...addressData,
            customer_id: customerId
        });
    }

    async updateAddress(customerId, addressId, addressData) {
        const address = await CustomerAddress.findOne({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) throw new Error('Address not found');

        if (addressData.is_default) {
            await CustomerAddress.update(
                { is_default: false },
                { where: { customer_id: customerId } }
            );
        }

        return await address.update(addressData);
    }

    async deleteAddress(customerId, addressId) {
        const address = await CustomerAddress.findOne({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) throw new Error('Address not found');

        await address.destroy();
        return { success: true };
    }

    async setDefaultAddress(customerId, addressId) {
        await CustomerAddress.update(
            { is_default: false },
            { where: { customer_id: customerId } }
        );

        const address = await CustomerAddress.findOne({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) throw new Error('Address not found');

        return await address.update({ is_default: true });
    }
}

module.exports = new AddressService();
