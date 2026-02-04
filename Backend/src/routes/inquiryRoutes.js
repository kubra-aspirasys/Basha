const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected
router.use(protect);

// Dashboard stats (Admin only)
router.get('/stats', authorize('admin'), inquiryController.getStats);

// Quote routes
router.post('/quotes', authorize('admin', 'staff'), inquiryController.createQuote);
router.get('/quotes', authorize('admin', 'staff'), inquiryController.getQuotes); // Requires ?inquiryId=

// Export
router.get('/export', authorize('admin'), inquiryController.exportInquiries);

// Inquiry CRUD
router.post('/', authorize('admin', 'staff'), inquiryController.createInquiry);
router.get('/', authorize('admin', 'staff'), inquiryController.getAllInquiries);
router.get('/:id', authorize('admin', 'staff'), inquiryController.getInquiryById);

// Update entire inquiry
router.patch('/:id', authorize('admin', 'staff'), inquiryController.updateInquiry);

// Inline updates
router.patch('/:id/status', authorize('admin', 'staff'), inquiryController.updateInquiryStatus);
router.patch('/:id/priority', authorize('admin', 'staff'), inquiryController.updateInquiryPriority);

// Delete (Admin only)
router.delete('/:id', authorize('admin'), inquiryController.deleteInquiry);

module.exports = router;
