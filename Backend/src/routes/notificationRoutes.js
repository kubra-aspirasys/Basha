const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', notificationController.getStats);

// Latest unread (for topbar dropdown)
router.get('/latest', notificationController.getLatestUnread);

// Generate notifications from recent activity
router.post('/generate', notificationController.generateFromActivity);

// Batch operations
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/mark-read', notificationController.markMultipleAsRead);
router.delete('/clear-read', notificationController.deleteAllRead);

// CRUD
router.get('/', notificationController.getAllNotifications);
router.post('/', notificationController.createNotification);
router.get('/:id', notificationController.getNotificationById);
router.patch('/:id', notificationController.updateNotification);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
