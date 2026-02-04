'use strict';
const paymentService = require('../services/paymentService');

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private (Admin)
const createPayment = async (req, res, next) => {
    try {
        const paymentData = req.body;
        const payment = await paymentService.createPayment(paymentData);

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPayments = async (req, res, next) => {
    try {
        const filters = req.query;
        const result = await paymentService.getAllPayments(filters);

        res.status(200).json({
            success: true,
            message: 'Payments retrieved successfully',
            data: result.payments,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private (Admin)
const getPaymentById = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        const payment = await paymentService.getPaymentById(paymentId);

        res.status(200).json({
            success: true,
            message: 'Payment retrieved successfully',
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment by transaction ID
// @route   GET /api/payments/transaction/:transactionId
// @access  Private (Admin)
const getPaymentByTransactionId = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        const payment = await paymentService.getPaymentByTransactionId(transactionId);

        res.status(200).json({
            success: true,
            message: 'Payment retrieved successfully',
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payments for a specific customer
// @route   GET /api/payments/customer/:customerId
// @access  Private (Admin)
const getCustomerPayments = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const payments = await paymentService.getCustomerPayments(customerId);

        res.status(200).json({
            success: true,
            message: 'Customer payments retrieved successfully',
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my payments (for logged in customer)
// @route   GET /api/payments/my
// @access  Private (Customer)
const getMyPayments = async (req, res, next) => {
    try {
        const customerId = req.user.userId;
        const payments = await paymentService.getCustomerPayments(customerId);

        res.status(200).json({
            success: true,
            message: 'My payments retrieved successfully',
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payments for a specific order
// @route   GET /api/payments/order/:orderId
// @access  Private (Admin)
const getOrderPayments = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const payments = await paymentService.getOrderPayments(orderId);

        res.status(200).json({
            success: true,
            message: 'Order payments retrieved successfully',
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id/status
// @access  Private (Admin)
const updatePaymentStatus = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        const { status } = req.body;

        const payment = await paymentService.updatePaymentStatus(paymentId, status);

        res.status(200).json({
            success: true,
            message: `Payment status updated to ${status}`,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update payment details
// @route   PUT /api/payments/:id
// @access  Private (Admin)
const updatePayment = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        const updateData = req.body;

        const payment = await paymentService.updatePayment(paymentId, updateData);

        res.status(200).json({
            success: true,
            message: 'Payment updated successfully',
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete payment (Soft Delete)
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
const deletePayment = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        const result = await paymentService.deletePayment(paymentId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (Admin)
const getPaymentStats = async (req, res, next) => {
    try {
        const filters = req.query;
        const stats = await paymentService.getPaymentStats(filters);

        res.status(200).json({
            success: true,
            message: 'Payment statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate transaction ID
// @route   GET /api/payments/generate-txn-id
// @access  Private (Admin)
const generateTransactionId = async (req, res, next) => {
    try {
        const transactionId = paymentService.generateTransactionId();

        res.status(200).json({
            success: true,
            message: 'Transaction ID generated successfully',
            data: { transaction_id: transactionId }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById,
    getPaymentByTransactionId,
    getCustomerPayments,
    getMyPayments,
    getOrderPayments,
    updatePaymentStatus,
    updatePayment,
    deletePayment,
    getPaymentStats,
    generateTransactionId
};
