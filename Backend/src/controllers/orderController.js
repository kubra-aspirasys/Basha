const orderService = require('../services/orderService');

// @desc    Create new order
// @route   POST /api/customer/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
    try {
        // Only use req.user.id for customers, admins create orders with null customer_id
        const customerId = req.user.role === 'admin' ? null : req.user.userId;
        const orderData = req.body;

        if (req.user.role !== 'admin') {
            const { SiteSetting } = require('../models');
            const storeSetting = await SiteSetting.findOne({ where: { key: 'is_store_active' } });
            if (storeSetting && storeSetting.value === 'false') {
                return res.status(400).json({
                    success: false,
                    message: 'We are currently closed and unable to accept new orders at this time.'
                });
            }
        }

        const order = await orderService.createOrder(customerId, orderData);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrders = async (req, res, next) => {
    try {
        const { status, startDate, endDate, customer_id, order_number, search } = req.query;
        const filters = { status, startDate, endDate, customer_id, order_number, search };
        const orders = await orderService.getAllOrders(filters);

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my orders
// @route   GET /api/customer/orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
    try {
        const customerId = req.user.userId;
        const orders = await orderService.getCustomerOrders(customerId);

        res.status(200).json({
            success: true,
            message: 'My orders retrieved successfully',
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order details
// @route   GET /api/orders/:id (Shared/Separate endpoints dispatching here)
// @access  Private (Admin/Customer)
const getOrderDetails = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        // If admin, can see any. If customer, only own.
        // Identify role from req.user
        const isCustomer = !req.user.role || req.user.role !== 'admin';
        const customerId = isCustomer ? req.user.userId : null;

        const order = await orderService.getOrderDetails(orderId, customerId);

        res.status(200).json({
            success: true,
            message: 'Order details retrieved successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const order = await orderService.updateOrderStatus(orderId, status);

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order details
// @route   PUT /api/admin/orders/:id
// @access  Private (Admin)
const updateOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const updateData = req.body;

        const order = await orderService.updateOrder(orderId, updateData);

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order
// @route   PUT /api/customer/orders/:id/cancel
// @access  Private (Customer)
const cancelOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const customerId = req.user.userId;

        const order = await orderService.cancelOrder(orderId, customerId);

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order (Soft Delete)
// @route   DELETE /api/admin/orders/:id
// @access  Private (Admin)
const deleteOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const result = await orderService.deleteOrder(orderId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrder,
    cancelOrder,
    deleteOrder
};
