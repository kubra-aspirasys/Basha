const express = require('express');
const router = express.Router();
const contactInquiryController = require('../controllers/contactInquiryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and limited to Admin/Staff
router.use(protect);
router.use(authorize('admin', 'staff'));

// Admin Inquiries Management
router.get('/', contactInquiryController.getAllInquiries);
router.delete('/bulk', contactInquiryController.bulkDeleteInquiries);
router.get('/:id', contactInquiryController.getInquiryById);
router.patch('/:id', contactInquiryController.updateInquiry);
router.delete('/:id', contactInquiryController.deleteInquiry);

module.exports = router;
