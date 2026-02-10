const express = require('express');
const router = express.Router();
const contactInquiryController = require('../controllers/contactInquiryController');

// POST /api/contact - Customer submission
router.post('/', contactInquiryController.submitInquiry);

module.exports = router;
