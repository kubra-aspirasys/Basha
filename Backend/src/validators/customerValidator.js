const Joi = require('joi');

const createCustomerSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Please enter a valid email address'
    }),
    phone: Joi.string().allow(null, '').pattern(/^[0-9+\-\s()]*$/).messages({
        'string.pattern.base': 'Please enter a valid phone number'
    }),
    address: Joi.string().allow(null, ''),
    is_blocked: Joi.boolean().default(false)
});

const updateStatusSchema = Joi.object({
    is_blocked: Joi.boolean().required().messages({
        'any.required': 'Status (is_blocked) is required'
    }),
    reason: Joi.string().allow(null, '') // Optional reason for detailed logs if needed later
});

const sendNotificationSchema = Joi.object({
    customers: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
        'array.min': 'Select at least one customer',
        'any.required': 'Customer list is required'
    }),
    type: Joi.string().valid('email', 'sms', 'whatsapp').required(),
    message: Joi.string().when('type', {
        is: 'whatsapp',
        then: Joi.string().required(),
        otherwise: Joi.string().optional()
    }),
    subject: Joi.string().when('type', {
        is: 'email',
        then: Joi.string().required(),
        otherwise: Joi.optional()
    }),
    emailBody: Joi.string().when('type', {
        is: 'email',
        then: Joi.string().required(),
        otherwise: Joi.optional()
    })
}).unknown(true); // Allow other fields like attachments if needed

module.exports = {
    createCustomerSchema,
    updateStatusSchema,
    sendNotificationSchema
};
