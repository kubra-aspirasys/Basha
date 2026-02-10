const express = require('express');
const router = express.Router();
const contactInquiryController = require('../controllers/contactInquiryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and limited to Admin
router.use(protect);
router.use(authorize('admin'));

// Admin Inquiries Management
router.get('/', contactInquiryController.getAllInquiries);
router.get('/:id', contactInquiryController.getInquiryById);
router.patch('/:id', contactInquiryController.updateInquiry);
router.delete('/:id', contactInquiryController.deleteInquiry);

module.exports = router;
