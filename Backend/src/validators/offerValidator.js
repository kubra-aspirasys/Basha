'use strict';
const Joi = require('joi');

// Custom validation for percentage
const discountValueCheck = (value, helpers) => {
    const { discount_type } = helpers.state.ancestors[0];
    if (discount_type === 'percentage' && value > 100) {
        return helpers.message('Percentage discount cannot exceed 100%');
    }
    return value;
};

// Create offer validation schema
const createOfferSchema = Joi.object({
    code: Joi.string().min(3).max(50).uppercase().trim().required().messages({
        'string.min': 'Offer code must be at least 3 characters',
        'string.max': 'Offer code cannot exceed 50 characters',
        'any.required': 'Offer code is required'
    }),
    discount_type: Joi.string().valid('percentage', 'fixed').required().messages({
        'any.only': 'Discount type must be either percentage or fixed',
        'any.required': 'Discount type is required'
    }),
    discount_value: Joi.number().positive().precision(2).required().custom(discountValueCheck).messages({
        'number.positive': 'Discount value must be positive',
        'any.required': 'Discount value is required'
    }),
    valid_from: Joi.date().iso().required().messages({
        'date.base': 'Valid from must be a valid date',
        'any.required': 'Start date is required'
    }),
    valid_to: Joi.date().iso().min(Joi.ref('valid_from')).required().messages({
        'date.min': 'End date cannot be before start date',
        'any.required': 'End date is required'
    }),
    is_active: Joi.boolean().default(true)
});

// Update offer validation schema
const updateOfferSchema = Joi.object({
    code: Joi.string().min(3).max(50).uppercase().trim().optional(),
    discount_type: Joi.string().valid('percentage', 'fixed').optional(),
    discount_value: Joi.number().positive().precision(2).optional().custom(discountValueCheck),
    valid_from: Joi.date().iso().optional(),
    valid_to: Joi.date().iso().min(Joi.ref('valid_from')).optional(),
    is_active: Joi.boolean().optional()
}).min(1);

// Validation middleware
const validateCreateOffer = (req, res, next) => {
    const { error, value } = createOfferSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    req.body = value;
    next();
};

const validateUpdateOffer = (req, res, next) => {
    const { error, value } = updateOfferSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    req.body = value;
    next();
};

module.exports = {
    validateCreateOffer,
    validateUpdateOffer
};
