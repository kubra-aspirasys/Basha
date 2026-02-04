'use strict';
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    validateCreatePayment,
    validateUpdatePayment,
    validateUpdateStatus,
    validatePaymentFilters
} = require('../validators/paymentValidator');

// All admin routes are protected and require admin role
router.use(protect);

// Generate transaction ID (Admin only)
router.get('/generate-txn-id', authorize('admin'), paymentController.generateTransactionId);

// Get payment statistics (Admin only)
router.get('/stats', authorize('admin'), paymentController.getPaymentStats);

// Get my payments (Customer only)
router.get('/my', authorize('customer'), paymentController.getMyPayments);

// Get payments for a specific customer (Admin only)
router.get('/customer/:customerId', authorize('admin'), paymentController.getCustomerPayments);

// Get payments for a specific order (Admin only)
router.get('/order/:orderId', authorize('admin'), paymentController.getOrderPayments);

// Get payment by transaction ID (Admin only)
router.get('/transaction/:transactionId', authorize('admin'), paymentController.getPaymentByTransactionId);

// Get all payments (Admin only) - with filter validation
router.get('/', authorize('admin'), validatePaymentFilters, paymentController.getAllPayments);

// Create new payment (Admin only) - with validation
router.post('/', authorize('admin'), validateCreatePayment, paymentController.createPayment);

// Get payment by ID (Admin only)
router.get('/:id', authorize('admin'), paymentController.getPaymentById);

// Update payment status (Admin only) - with validation
router.put('/:id/status', authorize('admin'), validateUpdateStatus, paymentController.updatePaymentStatus);

// Update payment details (Admin only) - with validation
router.put('/:id', authorize('admin'), validateUpdatePayment, paymentController.updatePayment);

// Delete payment (Admin only)
router.delete('/:id', authorize('admin'), paymentController.deletePayment);

module.exports = router;
