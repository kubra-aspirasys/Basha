const Joi = require('joi');

const createContactSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 2 characters',
        'any.required': 'Name is required'
    }),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required().messages({
        'string.pattern.base': 'Phone number must contain only digits',
        'string.min': 'Phone number must be at least 10 digits',
        'string.max': 'Phone number cannot exceed 15 digits',
        'any.required': 'Phone number is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
    }),
    subject: Joi.string().optional().allow('').default('General Inquiry'),
    message: Joi.string().min(5).required().messages({
        'string.min': 'Message must be at least 5 characters',
        'any.required': 'Message is required'
    }),
    eventType: Joi.string().optional().allow(''),
    eventDate: Joi.string().optional().allow(''),
    guestCount: Joi.string().optional().allow('')
});

module.exports = {
    createContactSchema
};
