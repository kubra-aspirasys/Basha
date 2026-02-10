const Joi = require('joi');

const createNotificationSchema = Joi.object({
    type: Joi.string().valid(
        'new_order', 'order_status', 'order_cancelled',
        'new_payment', 'payment_failed',
        'new_customer', 'new_inquiry',
        'low_stock', 'system', 'info'
    ).default('info'),
    title: Joi.string().required().messages({
        'any.required': 'Title is required',
        'string.empty': 'Title cannot be empty'
    }),
    message: Joi.string().required().messages({
        'any.required': 'Message is required',
        'string.empty': 'Message cannot be empty'
    }),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    reference_id: Joi.string().uuid().allow(null, ''),
    reference_type: Joi.string().allow(null, ''),
    metadata: Joi.object().allow(null)
});

const updateNotificationSchema = Joi.object({
    is_read: Joi.boolean(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    title: Joi.string(),
    message: Joi.string()
});

const markReadSchema = Joi.object({
    ids: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
        'any.required': 'Notification IDs are required',
        'array.min': 'At least one notification ID is required'
    })
});

module.exports = {
    createNotificationSchema,
    updateNotificationSchema,
    markReadSchema
};
