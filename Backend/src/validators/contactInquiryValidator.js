const Joi = require('joi');

const createContactInquirySchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'Name cannot be empty',
        'any.required': 'Name is required'
    }),
    phone: Joi.string().required().messages({
        'any.required': 'Phone number is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),
    subject: Joi.string().allow(null, '').default('General Inquiry'),
    message: Joi.string().min(5).required().messages({
        'string.min': 'Message must be at least 5 characters',
        'any.required': 'Message is required'
    }),
    eventType: Joi.string().optional().allow(null, ''),
    guestCount: Joi.number().integer().min(1).optional().allow(null).empty(''),
});

const updateContactInquiryStatusSchema = Joi.object({
    status: Joi.string().valid('Pending', 'Approved', 'Disapproved').required()
});

const updateContactInquiryAdminSchema = Joi.object({
    internal_notes: Joi.string().allow(null, ''),
    status: Joi.string().valid('Pending', 'Approved', 'Disapproved')
});

module.exports = {
    createContactInquirySchema,
    updateContactInquiryStatusSchema,
    updateContactInquiryAdminSchema
};
