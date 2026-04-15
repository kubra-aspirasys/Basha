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

// Get payment statistics (Admin/Staff)
router.get('/stats', authorize('admin', 'staff'), paymentController.getPaymentStats);

// Export payments (Admin only)
router.get('/export', authorize('admin'), validatePaymentFilters, paymentController.exportPayments);

// Get my payments (Customer only)
router.get('/my', authorize('customer'), paymentController.getMyPayments);

// Get payments for a specific customer (Admin/Staff)
router.get('/customer/:customerId', authorize('admin', 'staff'), paymentController.getCustomerPayments);

// Get payments for a specific order (Admin/Staff)
router.get('/order/:orderId', authorize('admin', 'staff'), paymentController.getOrderPayments);

// Get payment by transaction ID (Admin/Staff)
router.get('/transaction/:transactionId', authorize('admin', 'staff'), paymentController.getPaymentByTransactionId);

// Get all payments (Admin/Staff) - with filter validation
router.get('/', authorize('admin', 'staff'), validatePaymentFilters, paymentController.getAllPayments);

// Create new payment (Admin only) - with validation
router.post('/', authorize('admin'), validateCreatePayment, paymentController.createPayment);

// Get payment by ID (Admin/Staff)
router.get('/:id', authorize('admin', 'staff'), paymentController.getPaymentById);

// Update payment status (Admin only) - with validation
router.put('/:id/status', authorize('admin'), validateUpdateStatus, paymentController.updatePaymentStatus);

// Update payment details (Admin only) - with validation
router.put('/:id', authorize('admin'), validateUpdatePayment, paymentController.updatePayment);

// Delete payments (Admin only)
router.delete('/bulk', authorize('admin'), paymentController.bulkDeletePayments);
router.delete('/:id', authorize('admin'), paymentController.deletePayment);

module.exports = router;
