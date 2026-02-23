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
        const { code, order_total, customer_id } = req.body;

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

        if (customer_id) {
            const hasUsed = await UsedCoupon.findOne({
                where: { customer_id, offer_id: offer.id }
            });
            if (hasUsed) {
                return errorResponse(res, 'You have already used this coupon', 400);
            }
        }

        if (offer.applicable_to === 'specific') {
            if (!customer_id) {
                return errorResponse(res, 'This offer is for specific users only. Please login to use it.', 400);
            }
            const specificUsers = offer.specific_users || [];
            if (!specificUsers.includes(customer_id)) {
                return errorResponse(res, 'You are not eligible for this coupon', 400);
            }
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
        const { customer_id } = req.query;

        const allOffers = await Offer.findAll({
            where: {
                is_active: true,
                valid_from: { [Op.lte]: new Date() },
                valid_to: { [Op.gte]: new Date() }
            },
            attributes: ['id', 'code', 'discount_type', 'discount_value', 'valid_to', 'applicable_to', 'specific_users'],
            order: [['valid_to', 'ASC']] // Show expiring soon first
        });

        let usedOfferIds = [];
        if (customer_id) {
            const usedCoupons = await UsedCoupon.findAll({
                where: { customer_id },
                attributes: ['offer_id']
            });
            usedOfferIds = usedCoupons.map(uc => uc.offer_id);
        }

        const availableOffers = allOffers.filter(offer => {
            if (usedOfferIds.includes(offer.id)) return false;

            if (offer.applicable_to === 'all') return true;
            if (offer.applicable_to === 'specific' && customer_id) {
                const users = offer.specific_users || [];
                return users.includes(customer_id);
            }
            return false;
        }).map(offer => ({
            id: offer.id,
            code: offer.code,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            valid_to: offer.valid_to
        }));

        return successResponse(res, 'Available offers retrieved successfully', availableOffers);
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
        const { code, discount_type, discount_value, valid_from, valid_to, is_active, applicable_to, specific_users } = req.body;

        // Check if offer code exists (including soft-deleted records, since DB unique constraint covers all rows)
        const existingOffer = await Offer.findOne({ where: { code }, paranoid: false });
        if (existingOffer) {
            if (existingOffer.isSoftDeleted()) {
                // Restore the soft-deleted offer and update it
                await existingOffer.restore();
                await existingOffer.update({
                    discount_type,
                    discount_value,
                    valid_from,
                    valid_to,
                    is_active,
                    applicable_to: applicable_to || 'all',
                    specific_users: specific_users || []
                });
                return successResponse(res, 'Offer created successfully', existingOffer, 201);
            }
            return errorResponse(res, 'Offer code already exists', 400);
        }

        const offer = await Offer.create({
            code,
            discount_type,
            discount_value,
            valid_from,
            valid_to,
            is_active,
            applicable_to: applicable_to || 'all',
            specific_users: specific_users || []
        });

        return successResponse(res, 'Offer created successfully', offer, 201);
    } catch (error) {
        console.error('Error creating offer:', error);
        let message = error.message || 'Failed to create offer';
        let statusCode = 500;
        if (error.name === 'SequelizeValidationError' && error.errors) {
            message = error.errors.map(e => e.message).join(', ');
            statusCode = 400;
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            message = 'Offer code already exists';
            statusCode = 400;
        }
        if (error.name === 'SequelizeDatabaseError') {
            message = 'Database error: ' + error.message;
        }
        return errorResponse(res, message, statusCode);
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
        const { code, discount_type, discount_value, valid_from, valid_to, is_active, applicable_to, specific_users } = req.body;

        const offer = await Offer.findByPk(id);
        if (!offer) {
            return errorResponse(res, 'Offer not found', 404);
        }

        // Check unique code if code is changed
        if (code && code !== offer.code) {
            const existingOffer = await Offer.findOne({ where: { code }, paranoid: false });
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
            is_active,
            applicable_to: applicable_to || 'all',
            specific_users: applicable_to === 'specific' ? (specific_users || []) : []
        });

        return successResponse(res, 'Offer updated successfully', offer);
    } catch (error) {
        console.error('Error updating offer:', error);
        let message = error.message || 'Failed to update offer';
        let statusCode = 500;
        if (error.name === 'SequelizeValidationError' && error.errors) {
            message = error.errors.map(e => e.message).join(', ');
            statusCode = 400;
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            message = 'Offer code already exists';
            statusCode = 400;
        }
        return errorResponse(res, message, statusCode);
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

/**
 * Bulk delete offers
 * @route POST /api/offers/bulk-delete
 * @access Private/Admin
 */
exports.bulkDeleteOffers = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return errorResponse(res, 'Please provide an array of offer IDs to delete', 400);
        }

        await Offer.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        return successResponse(res, 'Selected offers deleted successfully');
    } catch (error) {
        console.error('Error in bulk deleting offers:', error);
        return errorResponse(res, 'Failed to delete selected offers', 500);
    }
};
