const Joi = require('joi');

const createInquirySchema = Joi.object({
    full_name: Joi.string().required().messages({
        'any.required': 'Full name is required',
        'string.empty': 'Full name cannot be empty'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please enter a valid email address'
    }),
    phone: Joi.string().required().messages({
        'any.required': 'Phone number is required'
    }),
    event_date: Joi.date().iso().allow(null, '').messages({
        'date.format': 'Event date must be a valid ISO date'
    }),
    event_type: Joi.string().valid('wedding', 'corporate', 'birthday', 'anniversary', 'private', 'other').allow(null, '').default('other'),
    guest_count: Joi.number().integer().min(1).allow(null, 0).messages({
        'number.min': 'Guest count must be at least 1'
    }),
    additional_details: Joi.string().allow(null, ''),
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed').default('new'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    assigned_to: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
    quote_amount: Joi.number().min(0).allow(null)
});

const updateInquirySchema = Joi.object({
    full_name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    event_date: Joi.date().iso().allow(null, ''),
    event_type: Joi.string().valid('wedding', 'corporate', 'birthday', 'anniversary', 'private', 'other').allow(null, ''),
    guest_count: Joi.number().integer().min(1).allow(null),
    additional_details: Joi.string().allow(null, ''),
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    assigned_to: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
    quote_amount: Joi.number().min(0).allow(null)
});

const statusUpdateSchema = Joi.object({
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed').required()
});

const priorityUpdateSchema = Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high').required()
});

const createQuoteSchema = Joi.object({
    inquiry_id: Joi.string().uuid().required(),
    amount: Joi.number().min(0).required(),
    details: Joi.string().allow(null, ''),
    valid_until: Joi.date().iso().allow(null),
    status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired').default('draft')
});

module.exports = {
    createInquirySchema,
    updateInquirySchema,
    statusUpdateSchema,
    priorityUpdateSchema,
    createQuoteSchema
};
