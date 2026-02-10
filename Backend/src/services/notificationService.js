const { Notification, Order, Customer, Inquiry, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

const logAudit = (action, details, user = 'system') => {
    console.log(`[AUDIT] Action: ${action} | User: ${user} | Details: ${JSON.stringify(details)}`);
};

/**
 * Create a new notification
 */
const createNotification = async (data) => {
    const notification = await Notification.create(data);
    logAudit('CREATE_NOTIFICATION', { notificationId: notification.id, type: data.type });
    return notification;
};

/**
 * Get all notifications with pagination, filters, and search
 */
const getAllNotifications = async ({ search, type, priority, is_read, sort, page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        where[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { message: { [Op.like]: `%${search}%` } }
        ];
    }

    if (type && type !== 'all') {
        where.type = type;
    }

    if (priority && priority !== 'all') {
        where.priority = priority;
    }

    if (is_read !== undefined && is_read !== '' && is_read !== 'all') {
        where.is_read = is_read === 'true' || is_read === true;
    }

    let order = [['created_at', 'DESC']];
    if (sort) {
        if (sort === 'created_at_asc') order = [['created_at', 'ASC']];
        else if (sort === 'created_at_desc') order = [['created_at', 'DESC']];
        else if (sort === 'priority_desc') order = [['priority', 'DESC'], ['created_at', 'DESC']];
    }

    const { count, rows } = await Notification.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
    });

    return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        notifications: rows
    };
};

/**
 * Get a single notification by ID
 */
const getNotificationById = async (id) => {
    return await Notification.findByPk(id);
};

/**
 * Update a notification
 */
const updateNotification = async (id, data) => {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    await notification.update(data);
    logAudit('UPDATE_NOTIFICATION', { notificationId: id, changes: data });
    return notification;
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (id) => {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    await notification.update({ is_read: true });
    return notification;
};

/**
 * Mark multiple notifications as read
 */
const markMultipleAsRead = async (ids) => {
    const [affectedCount] = await Notification.update(
        { is_read: true },
        { where: { id: { [Op.in]: ids } } }
    );
    logAudit('MARK_MULTIPLE_READ', { ids, affectedCount });
    return affectedCount;
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async () => {
    const [affectedCount] = await Notification.update(
        { is_read: true },
        { where: { is_read: false } }
    );
    logAudit('MARK_ALL_READ', { affectedCount });
    return affectedCount;
};

/**
 * Delete a notification (soft delete)
 */
const deleteNotification = async (id) => {
    const notification = await Notification.findByPk(id);
    if (!notification) return null;
    await notification.destroy();
    logAudit('DELETE_NOTIFICATION', { notificationId: id });
    return true;
};

/**
 * Delete all read notifications
 */
const deleteAllRead = async () => {
    const affectedCount = await Notification.destroy({
        where: { is_read: true }
    });
    logAudit('DELETE_ALL_READ', { affectedCount });
    return affectedCount;
};

/**
 * Get notification statistics
 */
const getNotificationStats = async () => {
    const total = await Notification.count();
    const unread = await Notification.count({ where: { is_read: false } });
    const read = await Notification.count({ where: { is_read: true } });

    // Count by type
    const byType = await Notification.findAll({
        attributes: [
            'type',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
    });

    // Count by priority
    const byPriority = await Notification.findAll({
        attributes: [
            'priority',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority'],
        raw: true
    });

    // Today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Notification.count({
        where: {
            created_at: { [Op.gte]: today }
        }
    });

    return {
        total,
        unread,
        read,
        todayCount,
        byType: byType.reduce((acc, item) => { acc[item.type] = parseInt(item.count); return acc; }, {}),
        byPriority: byPriority.reduce((acc, item) => { acc[item.priority] = parseInt(item.count); return acc; }, {})
    };
};

/**
 * Get the latest N unread notifications (for topbar dropdown)
 */
const getLatestUnread = async (limit = 5) => {
    return await Notification.findAll({
        where: { is_read: false },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit)
    });
};

/**
 * Auto-generate notifications from recent activity
 * This scans orders, customers, inquiries, and payments for new entries
 * and generates notifications if they don't already exist.
 */
const generateFromActivity = async () => {
    const results = { created: 0, types: [] };

    try {
        // 1. New orders (last 24 hours) without corresponding notifications
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const recentOrders = await Order.findAll({
            where: { created_at: { [Op.gte]: yesterday } },
            order: [['created_at', 'DESC']]
        });

        for (const order of recentOrders) {
            const exists = await Notification.findOne({
                where: {
                    reference_id: order.id,
                    reference_type: 'order',
                    type: 'new_order'
                }
            });
            if (!exists) {
                await Notification.create({
                    type: 'new_order',
                    title: `New Order #${order.order_number || order.id.slice(0, 8)}`,
                    message: `New ${order.order_type} order from ${order.customer_name || 'Customer'} worth ₹${order.total_amount || 0}`,
                    priority: 'high',
                    reference_id: order.id,
                    reference_type: 'order',
                    metadata: {
                        order_number: order.order_number,
                        customer_name: order.customer_name,
                        total_amount: order.total_amount,
                        order_type: order.order_type,
                        status: order.status
                    }
                });
                results.created++;
                results.types.push('new_order');
            }
        }

        // 2. New customers (last 24 hours)
        const recentCustomers = await Customer.findAll({
            where: { created_at: { [Op.gte]: yesterday } },
            order: [['created_at', 'DESC']]
        });

        for (const customer of recentCustomers) {
            const exists = await Notification.findOne({
                where: {
                    reference_id: customer.id,
                    reference_type: 'customer',
                    type: 'new_customer'
                }
            });
            if (!exists) {
                await Notification.create({
                    type: 'new_customer',
                    title: `New Customer Registered`,
                    message: `${customer.name || customer.full_name || 'A customer'} has registered. Phone: ${customer.phone || 'N/A'}`,
                    priority: 'medium',
                    reference_id: customer.id,
                    reference_type: 'customer',
                    metadata: {
                        customer_name: customer.name || customer.full_name,
                        phone: customer.phone,
                        email: customer.email
                    }
                });
                results.created++;
                results.types.push('new_customer');
            }
        }

        // 3. New inquiries (last 24 hours)
        const recentInquiries = await Inquiry.findAll({
            where: { created_at: { [Op.gte]: yesterday } },
            order: [['created_at', 'DESC']]
        });

        for (const inquiry of recentInquiries) {
            const exists = await Notification.findOne({
                where: {
                    reference_id: inquiry.id,
                    reference_type: 'inquiry',
                    type: 'new_inquiry'
                }
            });
            if (!exists) {
                await Notification.create({
                    type: 'new_inquiry',
                    title: `New Inquiry from ${inquiry.full_name}`,
                    message: `${inquiry.full_name} submitted a ${inquiry.event_type || 'general'} inquiry for ${inquiry.guest_count || 'N/A'} guests`,
                    priority: inquiry.priority || 'medium',
                    reference_id: inquiry.id,
                    reference_type: 'inquiry',
                    metadata: {
                        full_name: inquiry.full_name,
                        event_type: inquiry.event_type,
                        guest_count: inquiry.guest_count,
                        event_date: inquiry.event_date
                    }
                });
                results.created++;
                results.types.push('new_inquiry');
            }
        }

        // 4. New payments (last 24 hours)
        const recentPayments = await Payment.findAll({
            where: { created_at: { [Op.gte]: yesterday } },
            order: [['created_at', 'DESC']]
        });

        for (const payment of recentPayments) {
            const exists = await Notification.findOne({
                where: {
                    reference_id: payment.id,
                    reference_type: 'payment',
                    type: 'new_payment'
                }
            });
            if (!exists) {
                const pType = payment.status === 'failed' ? 'payment_failed' : 'new_payment';
                await Notification.create({
                    type: pType,
                    title: pType === 'payment_failed'
                        ? `Payment Failed`
                        : `Payment Received - ₹${payment.amount || 0}`,
                    message: pType === 'payment_failed'
                        ? `A payment of ₹${payment.amount || 0} has failed. Method: ${payment.payment_method || 'N/A'}`
                        : `Payment of ₹${payment.amount || 0} received via ${payment.payment_method || 'N/A'}`,
                    priority: pType === 'payment_failed' ? 'urgent' : 'medium',
                    reference_id: payment.id,
                    reference_type: 'payment',
                    metadata: {
                        amount: payment.amount,
                        payment_method: payment.payment_method,
                        status: payment.status
                    }
                });
                results.created++;
                results.types.push(pType);
            }
        }

        // 5. Cancelled orders (last 24 hours)
        const cancelledOrders = await Order.findAll({
            where: {
                status: 'cancelled',
                updated_at: { [Op.gte]: yesterday }
            },
            order: [['updated_at', 'DESC']]
        });

        for (const order of cancelledOrders) {
            const exists = await Notification.findOne({
                where: {
                    reference_id: order.id,
                    reference_type: 'order',
                    type: 'order_cancelled'
                }
            });
            if (!exists) {
                await Notification.create({
                    type: 'order_cancelled',
                    title: `Order #${order.order_number || order.id.slice(0, 8)} Cancelled`,
                    message: `Order from ${order.customer_name || 'Customer'} worth ₹${order.total_amount || 0} has been cancelled`,
                    priority: 'high',
                    reference_id: order.id,
                    reference_type: 'order',
                    metadata: {
                        order_number: order.order_number,
                        customer_name: order.customer_name,
                        total_amount: order.total_amount
                    }
                });
                results.created++;
                results.types.push('order_cancelled');
            }
        }
    } catch (error) {
        console.error('Error generating notifications from activity:', error);
    }

    return results;
};

module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    updateNotification,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getNotificationStats,
    getLatestUnread,
    generateFromActivity
};
