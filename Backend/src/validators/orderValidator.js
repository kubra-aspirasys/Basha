const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: errors.array()
        });
    }
    next();
};

const createOrderValidator = [
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('items.*.menu_item_id').isUUID().withMessage('Invalid menu item ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('delivery_address').notEmpty().withMessage('Delivery address is required'),
    body('customer_name').notEmpty().withMessage('Customer name is required'),
    body('customer_phone').notEmpty().withMessage('Customer phone is required'), // Could add regex for phone validation
    body('order_type').isIn(['pickup', 'delivery']).withMessage('Order type must be pickup or delivery'),
    validate
];

const updateStatusValidator = [
    param('id').isUUID().withMessage('Invalid order ID'),
    body('status').isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Invalid status value'),
    validate
];

const mongoIdValidator = [
    // Although we use UUIDs (sequelize default in models), naming this generically. 
    // Actually, models use UUIDV4.
    param('id').isUUID().withMessage('Invalid ID format'),
    validate
];

module.exports = {
    createOrderValidator,
    updateStatusValidator,
    mongoIdValidator
};
