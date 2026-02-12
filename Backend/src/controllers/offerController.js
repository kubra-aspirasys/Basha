'use strict';
const { Offer } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

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
