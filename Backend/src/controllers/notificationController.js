const notificationService = require('../services/notificationService');
const { createNotificationSchema, updateNotificationSchema, markReadSchema } = require('../validators/notificationValidator');

const getAllNotifications = async (req, res) => {
    try {
        const result = await notificationService.getAllNotifications(req.query);
        res.json({ success: true, message: 'Notifications fetched successfully', data: result });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getNotificationById = async (req, res) => {
    try {
        const notification = await notificationService.getNotificationById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification fetched successfully', data: notification });
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const createNotification = async (req, res) => {
    try {
        const { error, value } = createNotificationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const notification = await notificationService.createNotification(value);
        res.status(201).json({ success: true, message: 'Notification created successfully', data: notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateNotification = async (req, res) => {
    try {
        const { error, value } = updateNotificationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const updated = await notificationService.updateNotification(req.params.id, value);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification updated successfully', data: updated });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification marked as read', data: notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const markMultipleAsRead = async (req, res) => {
    try {
        const { error, value } = markReadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const count = await notificationService.markMultipleAsRead(value.ids);
        res.json({ success: true, message: `${count} notifications marked as read`, data: { affectedCount: count } });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const count = await notificationService.markAllAsRead();
        res.json({ success: true, message: `${count} notifications marked as read`, data: { affectedCount: count } });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const success = await notificationService.deleteNotification(req.params.id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteAllRead = async (req, res) => {
    try {
        const count = await notificationService.deleteAllRead();
        res.json({ success: true, message: `${count} read notifications deleted`, data: { affectedCount: count } });
    } catch (error) {
        console.error('Error deleting read notifications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await notificationService.getNotificationStats();
        res.json({ success: true, message: 'Stats fetched successfully', data: stats });
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getLatestUnread = async (req, res) => {
    try {
        const limit = req.query.limit || 5;
        const notifications = await notificationService.getLatestUnread(limit);
        const stats = await notificationService.getNotificationStats();
        res.json({
            success: true,
            message: 'Latest unread notifications fetched',
            data: {
                notifications,
                unreadCount: stats.unread
            }
        });
    } catch (error) {
        console.error('Error fetching latest unread:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const generateFromActivity = async (req, res) => {
    try {
        const results = await notificationService.generateFromActivity();
        res.json({
            success: true,
            message: `Generated ${results.created} notifications from recent activity`,
            data: results
        });
    } catch (error) {
        console.error('Error generating notifications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getStats,
    getLatestUnread,
    generateFromActivity
};
