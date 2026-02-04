'use strict';
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { updateProfileValidator, changePasswordValidator } = require('../validators/profileValidator');
const { protect } = require('../middleware/authMiddleware');

// All profile routes require authentication
router.use(protect);

router.get('/', profileController.getProfile);
router.put('/', updateProfileValidator, profileController.updateProfile);
router.post('/avatar', profileController.uploadAvatar);
router.post('/change-password', changePasswordValidator, profileController.changePassword);

module.exports = router;
