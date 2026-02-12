'use strict';
const { Offer, UsedCoupon } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { Op } = require('sequelize');

/**
 * Validate a coupon code
 * @route POST /api/offers/validate
 * @access Public
 */
exports.validateOffer = async (req, res, next) => {
    try {
        const { code, order_total } = req.body;

        if (!code) {
            return errorResponse(res, 'Coupon code is required', 400);
        }

        const offer = await Offer.findOne({
            where: {
                code: code.toUpperCase(),
                is_active: true,
                valid_from: { [Op.lte]: new Date() },
                valid_to: { [Op.gte]: new Date() }
            }
        });

        if (!offer) {
            return errorResponse(res, 'Invalid or expired coupon code', 400);
        }

        let discount = 0;
        if (offer.discount_type === 'percentage') {
            discount = (parseFloat(order_total) * parseFloat(offer.discount_value)) / 100;
        } else {
            discount = parseFloat(offer.discount_value);
        }

        // Cap discount at order total if needed, or implement max discount logic
        if (discount > parseFloat(order_total)) {
            discount = parseFloat(order_total);
        }

        return successResponse(res, 'Coupon applied successfully', {
            id: offer.id,
            code: offer.code,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            calculated_discount: discount.toFixed(2)
        });

    } catch (error) {
        console.error('Error validating offer:', error);
        return errorResponse(res, 'Failed to validate coupon', 500);
    }
};

/**
 * Get active publicly available offers
 * @route GET /api/offers/available
 * @access Public
 */
exports.getPublicOffers = async (req, res, next) => {
    try {
        const offers = await Offer.findAll({
            where: {
                is_active: true,
                valid_from: { [Op.lte]: new Date() },
                valid_to: { [Op.gte]: new Date() }
            },
            attributes: ['id', 'code', 'discount_type', 'discount_value', 'valid_to'], // Exclude internal fields if any
            order: [['valid_to', 'ASC']] // Show expiring soon first
        });

        return successResponse(res, 'Available offers retrieved successfully', offers);
    } catch (error) {
        console.error('Error fetching public offers:', error);
        return errorResponse(res, 'Failed to fetch offers', 500);
    }
};

/**
 * Get all offers
 * @route GET /api/offers
 * @access Private/Admin
 */
exports.getAllOffers = async (req, res, next) => {
    try {
        const offers = await Offer.findAll({
            order: [['created_at', 'DESC']]
        });

        return successResponse(res, 'Offers retrieved successfully', offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        return errorResponse(res, 'Failed to fetch offers', 500);
    }
};

/**
 * Create a new offer
 * @route POST /api/offers
 * @access Private/Admin
 */
exports.createOffer = async (req, res, next) => {
    try {
        const { code, discount_type, discount_value, valid_from, valid_to, is_active } = req.body;

        // Check if offer code exists
        const existingOffer = await Offer.findOne({ where: { code } });
        if (existingOffer) {
            return errorResponse(res, 'Offer code already exists', 400);
        }

        const offer = await Offer.create({
            code,
            discount_type,
            discount_value,
            valid_from,
            valid_to,
            is_active
        });

        return successResponse(res, 'Offer created successfully', offer, 201);
    } catch (error) {
        console.error('Error creating offer:', error);
        return errorResponse(res, 'Failed to create offer', 500);
    }
};

/**
 * Update an offer
 * @route PUT /api/offers/:id
 * @access Private/Admin
 */
exports.updateOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, discount_type, discount_value, valid_from, valid_to, is_active } = req.body;

        const offer = await Offer.findByPk(id);
        if (!offer) {
            return errorResponse(res, 'Offer not found', 404);
        }

        // Check unique code if code is changed
        if (code && code !== offer.code) {
            const existingOffer = await Offer.findOne({ where: { code } });
            if (existingOffer) {
                return errorResponse(res, 'Offer code already exists', 400);
            }
        }

        await offer.update({
            code,
            discount_type,
            discount_value,
            valid_from,
            valid_to,
            is_active
        });

        return successResponse(res, 'Offer updated successfully', offer);
    } catch (error) {
        console.error('Error updating offer:', error);
        return errorResponse(res, 'Failed to update offer', 500);
    }
};

/**
 * Delete an offer
 * @route DELETE /api/offers/:id
 * @access Private/Admin
 */
exports.deleteOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findByPk(id);

        if (!offer) {
            return errorResponse(res, 'Offer not found', 404);
        }

        await offer.destroy();

        return successResponse(res, 'Offer deleted successfully');
    } catch (error) {
        console.error('Error deleting offer:', error);
        return errorResponse(res, 'Failed to delete offer', 500);
    }
};
