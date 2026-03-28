'use strict';
const { Offer, UsedCoupon } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Validate a coupon code
 * @route POST /api/offers/validate
 * @access Public
 */
exports.validateOffer = async (req, res, next) => {
    try {
        const { code, order_total, customer_id, items } = req.body;

        if (!code) {
            return errorResponse(res, 'Coupon code is required', 400);
        }

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const offer = await Offer.findOne({
            where: {
                code: code.toUpperCase(),
                is_active: true,
                [Op.and]: [
                    { [Op.or]: [{ valid_from: null }, { valid_from: { [Op.lte]: now } }] },
                    { [Op.or]: [{ valid_to: null }, { valid_to: { [Op.gte]: startOfDay } }] }
                ]
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

        let applicableTotal = parseFloat(order_total);
        if (offer.item_applicability === 'specific') {
            if (!items || !Array.isArray(items) || items.length === 0) {
                return errorResponse(res, 'This coupon is for specific items only. Please add applicable items to your cart.', 400);
            }

            const specificItems = offer.specific_items || [];
            const matchingItems = items.filter(item => specificItems.includes(item.menu_item_id));

            if (matchingItems.length === 0) {
                return errorResponse(res, 'This coupon doesn\'t apply to any items in your cart.', 400);
            }

            applicableTotal = matchingItems.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
        }

        let discount = 0;
        if (offer.discount_type === 'percentage') {
            discount = (applicableTotal * parseFloat(offer.discount_value)) / 100;
            if (offer.max_discount_value && discount > parseFloat(offer.max_discount_value)) {
                discount = parseFloat(offer.max_discount_value);
            }
        } else {
            discount = parseFloat(offer.discount_value);
        }

        // Cap discount at order total
        if (discount > parseFloat(order_total)) {
            discount = parseFloat(order_total);
        }

        return successResponse(res, 'Coupon applied successfully', {
            id: offer.id,
            code: offer.code,
            description: offer.description,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            max_discount_value: offer.max_discount_value,
            item_applicability: offer.item_applicability,
            specific_items: offer.specific_items,
            valid_to: offer.valid_to,
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
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const allOffers = await Offer.findAll({
            where: {
                is_active: true,
                [Op.and]: [
                    { [Op.or]: [{ valid_from: null }, { valid_from: { [Op.lte]: now } }] },
                    { [Op.or]: [{ valid_to: null }, { valid_to: { [Op.gte]: startOfDay } }] }
                ]
            },
            attributes: ['id', 'code', 'discount_type', 'discount_value', 'description', 'max_discount_value', 'valid_to', 'applicable_to', 'specific_users', 'item_applicability', 'specific_items'],
            order: [['valid_to', 'ASC']]
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
            description: offer.description,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            max_discount_value: offer.max_discount_value,
            valid_to: offer.valid_to,
            item_applicability: offer.item_applicability,
            specific_items: offer.specific_items
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
        const { code, discount_type, discount_value, max_discount_value, description, valid_from, valid_to, is_active, applicable_to, specific_users, item_applicability, specific_items } = req.body;

        // Check if offer code already exists
        const existingOffer = await Offer.findOne({ where: { code } });
        if (existingOffer) {
            return errorResponse(res, 'Offer code already exists', 400);
        }

        const offer = await Offer.create({
            code,
            discount_type,
            discount_value,
            max_discount_value,
            description,
            valid_from,
            valid_to,
            is_active,
            applicable_to: applicable_to || 'all',
            specific_users: specific_users || [],
            item_applicability: item_applicability || 'all',
            specific_items: specific_items || []
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
        const { code, discount_type, discount_value, max_discount_value, description, valid_from, valid_to, is_active, applicable_to, specific_users, item_applicability, specific_items } = req.body;

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
            max_discount_value,
            description,
            valid_from,
            valid_to,
            is_active,
            applicable_to: applicable_to || 'all',
            specific_users: applicable_to === 'specific' ? (specific_users || []) : [],
            item_applicability: item_applicability || 'all',
            specific_items: item_applicability === 'specific' ? (specific_items || []) : []
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

/**
 * Mark offers as used for specific users
 * @route POST /api/offers/:id/mark-used
 * @access Private/Admin
 */
exports.markOfferAsUsed = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_ids } = req.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return errorResponse(res, 'Please provide an array of user IDs', 400);
        }

        const offer = await Offer.findByPk(id);
        if (!offer) {
            return errorResponse(res, 'Offer not found', 404);
        }

        const usedCouponsToInsert = user_ids.map(userId => ({
            id: uuidv4(),
            order_id: uuidv4(), // Generate a placeholder UUID for the order
            offer_id: offer.id,
            customer_id: userId,
            discount_amount: 0 // No actual discount applied
        }));

        // Ignore if already marked (we could check first, or let unique constraints fail. Because UsedCoupon doesn't have a unique constraint on customer+offer, we should check first to prevent duplicates)
        const existingUsed = await UsedCoupon.findAll({
            where: {
                offer_id: offer.id,
                customer_id: {
                    [Op.in]: user_ids
                }
            }
        });
        const existingUsers = existingUsed.map(uc => uc.customer_id);

        const newToInsert = usedCouponsToInsert.filter(uc => !existingUsers.includes(uc.customer_id));

        if (newToInsert.length > 0) {
            await UsedCoupon.bulkCreate(newToInsert);
        }

        return successResponse(res, `Offer marked as used for ${newToInsert.length} users successfully`);
    } catch (error) {
        console.error('Error marking offer as used:', error);
        return errorResponse(res, 'Failed to mark offer as used', 500);
    }
};
