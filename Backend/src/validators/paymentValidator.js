'use strict';
const Joi = require('joi');

// Create payment validation schema
const createPaymentSchema = Joi.object({
    transaction_id: Joi.string().max(50).optional(),
    order_id: Joi.string().uuid().allow(null, '').optional(),
    customer_id: Joi.string().uuid().allow(null, '').optional(),
    customer_name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Customer name must be at least 2 characters',
        'string.max': 'Customer name must be less than 100 characters',
        'any.required': 'Customer name is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
        'number.positive': 'Amount must be a positive number',
        'any.required': 'Amount is required'
    }),
    payment_mode: Joi.string().valid('cash', 'upi', 'card', 'netbanking').default('cash').messages({
        'any.only': 'Payment mode must be one of: cash, upi, card, netbanking'
    }),
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').default('pending').messages({
        'any.only': 'Status must be one of: pending, completed, failed, refunded'
    }),
    notes: Joi.string().max(1000).allow(null, '').optional(),
    payment_reference: Joi.string().max(100).allow(null, '').optional()
});

// Update payment validation schema
const updatePaymentSchema = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').optional().messages({
        'any.only': 'Status must be one of: pending, completed, failed, refunded'
    }),
    notes: Joi.string().max(1000).allow(null, '').optional(),
    payment_reference: Joi.string().max(100).allow(null, '').optional(),
    payment_mode: Joi.string().valid('cash', 'upi', 'card', 'netbanking').optional().messages({
        'any.only': 'Payment mode must be one of: cash, upi, card, netbanking'
    })
});

// Update status validation schema
const updateStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required().messages({
        'any.only': 'Status must be one of: pending, completed, failed, refunded',
        'any.required': 'Status is required'
    })
});

// Filter validation schema
const filterPaymentsSchema = Joi.object({
    status: Joi.string().valid('all', 'pending', 'completed', 'failed', 'refunded').optional(),
    payment_mode: Joi.string().valid('all', 'cash', 'upi', 'card', 'netbanking').optional(),
    customer_id: Joi.string().uuid().optional(),
    order_id: Joi.string().uuid().optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
    transaction_id: Joi.string().optional(),
    customer_name: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(50).optional()
});

// Validation middleware
const validateCreatePayment = (req, res, next) => {
    const { error, value } = createPaymentSchema.validate(req.body, { abortEarly: false });
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

const validateUpdatePayment = (req, res, next) => {
    const { error, value } = updatePaymentSchema.validate(req.body, { abortEarly: false });
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

const validateUpdateStatus = (req, res, next) => {
    const { error, value } = updateStatusSchema.validate(req.body, { abortEarly: false });
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

const validatePaymentFilters = (req, res, next) => {
    const { error, value } = filterPaymentsSchema.validate(req.query, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    req.query = value;
    next();
};

module.exports = {
    createPaymentSchema,
    updatePaymentSchema,
    updateStatusSchema,
    filterPaymentsSchema,
    validateCreatePayment,
    validateUpdatePayment,
    validateUpdateStatus,
    validatePaymentFilters
};
