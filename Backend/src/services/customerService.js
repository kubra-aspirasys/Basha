const { Customer, Order, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CustomerService {
    /**
     * Get Dashboard Stats
     */
    async getStats() {
        const totalCustomers = await Customer.count();
        const activeCustomers = await Customer.count({ where: { is_active: true, is_blocked: false } });
        const blockedCustomers = await Customer.count({ where: { is_blocked: true } });

        // Revenue calculation from Orders (sum of total_amount for non-cancelled orders)
        const revenueResult = await Order.sum('total_amount', {
            where: {
                status: { [Op.ne]: 'cancelled' }
            }
        });
        const totalRevenue = revenueResult || 0;

        return {
            totalCustomers,
            activeCustomers,
            blockedCustomers,
            totalRevenue
        };
    }

    /**
     * Create new customer
     */
    async createCustomer(data) {
        // Check for existing email
        const existingEmail = await Customer.findOne({ where: { email: data.email } });
        if (existingEmail) {
            throw new Error('Email already registered');
        }

        // Check for existing phone if provided
        if (data.phone) {
            const existingPhone = await Customer.findOne({ where: { phone: data.phone } });
            if (existingPhone) {
                throw new Error('Phone number already registered');
            }
        }

        return await Customer.create({
            ...data,
            is_active: true,
            is_blocked: data.is_blocked || false,
            // Use current time for last_activity if needed, or let it default
            last_activity: new Date()
        });
    }

    /**
     * List customers with pagination, filtering, searching, sorting
     */
    async listCustomers(query) {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            sort = 'created_at',
            order = 'DESC'
        } = query;

        const offset = (page - 1) * limit;
        const whereClause = {};

        // Search
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        // Status Filter
        if (status) {
            if (status === 'active') {
                whereClause.is_blocked = false;
                whereClause.is_active = true;
            } else if (status === 'blocked') {
                whereClause.is_blocked = true;
            } else if (status === 'new') {
                // Example: Joined in last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                whereClause.createdAt = { [Op.gte]: thirtyDaysAgo };
            }
            // Add more status logic as needed
        }

        // Sorting
        let orderClause = [['created_at', 'DESC']]; // Default
        const validColumns = ['name', 'email', 'created_at', 'is_blocked', 'is_active'];

        if (validColumns.includes(sort)) {
            orderClause = [[sort, order.toUpperCase()]];
        } else if (sort === 'total_spent' || sort === 'orders_count') {
            // These are handled after fetching enriched data
            orderClause = [['created_at', order.toUpperCase()]]; // Temporary SQL sort
        } else if (sort === 'orders') {
            // Map frontend 'orders' to backend 'orders_count'
            orderClause = [['created_at', order.toUpperCase()]];
        } else if (sort === 'spending') {
            // Map frontend 'spending' to backend 'total_spent'
            orderClause = [['created_at', order.toUpperCase()]];
        }

        const { count, rows } = await Customer.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause
        });

        // Enrich rows with stats if needed (like total spent)
        // Doing this efficiently: fetch aggregate order stats for these customer IDs
        const customerIds = rows.map(c => c.id);
        const orderStats = await Order.findAll({
            attributes: [
                'customer_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalSpent']
            ],
            where: {
                customer_id: { [Op.in]: customerIds },
                status: { [Op.ne]: 'cancelled' }
            },
            group: ['customer_id'],
            raw: true
        });

        const statsMap = {};
        orderStats.forEach(stat => {
            statsMap[stat.customer_id] = {
                orderCount: parseInt(stat.orderCount || 0),
                totalSpent: parseFloat(stat.totalSpent || 0)
            };
        });

        const enrichedRows = rows.map(customer => {
            const stats = statsMap[customer.id] || { orderCount: 0, totalSpent: 0 };
            return {
                ...customer.toJSON(),
                orders_count: stats.orderCount,
                total_spent: stats.totalSpent
            };
        });

        // If sorting was by total_spent, we sort the page results (approximation)
        // or for full accuracy we would need a different approach. For now, page-level sort is acceptable fallback
        // If sorting was by total_spent or orders_count, we sort the page results
        if (['total_spent', 'orders_count', 'orders', 'spending'].includes(sort)) {
            const sortKey = sort === 'orders' ? 'orders_count' : (sort === 'spending' ? 'total_spent' : sort);
            enrichedRows.sort((a, b) => {
                const valA = a[sortKey] || 0;
                const valB = b[sortKey] || 0;
                return order.toUpperCase() === 'DESC'
                    ? valB - valA
                    : valA - valB;
            });
        }

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: enrichedRows
        };
    }

    /**
     * Get Customer Details
     */
    async getCustomerDetails(id) {
        const customer = await Customer.findByPk(id);
        if (!customer) throw new Error('Customer not found');

        // Get Orders
        const orders = await Order.findAll({
            where: { customer_id: id },
            order: [['createdAt', 'DESC']]
        });

        // Calculate stats
        const totalSpent = orders.reduce((sum, ord) => {
            return ord.status !== 'cancelled' ? sum + parseFloat(ord.total_amount) : sum;
        }, 0);

        return {
            ...customer.toJSON(),
            orders,
            stats: {
                total_spent: totalSpent,
                total_orders: orders.length
            }
        };
    }

    /**
     * Update Customer Status (Block/Unblock)
     */
    async updateStatus(id, isBlocked, reason, actorId) {
        const customer = await Customer.findByPk(id);
        if (!customer) throw new Error('Customer not found');

        customer.is_blocked = isBlocked;
        // Optionally log to audit table or user_status_history if models existed
        // Since strict requirements say "Work with existing", and no Audit model was found in file list, 
        // we will just update the customer record.

        await customer.save();
        return customer;
    }

    /**
     * Export Customers (Helper)
     */
    async getAllCustomersForExport(filters) {
        // Reuse listCustomers logic but without pagination limit
        const result = await this.listCustomers({ ...filters, limit: 100000 });
        return result.data;
    }

    async sendNotification(data) {
        const { customers: customerIds, type, message, subject, image_data, attachment_data, attachment_name, baseUrl } = data;

        try {
            const customers = await Customer.findAll({
                where: { id: { [Op.in]: customerIds } }
            });

            if (type === 'email') {
                const emailService = require('./emailService');
                const results = [];

                for (const customer of customers) {
                    if (customer.email) {
                        const attachments = [];
                        if (attachment_data) {
                            const matches = attachment_data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                            attachments.push({
                                filename: attachment_name || 'attachment',
                                content: matches ? Buffer.from(matches[2], 'base64') : Buffer.from(attachment_data, 'base64'),
                                contentType: matches ? matches[1] : 'application/octet-stream'
                            });
                        }

                        const status = await emailService.sendEmail({
                            to: customer.email,
                            subject: subject || 'Notification',
                            html: `<div style="font-family: sans-serif;">${message.replace(/\n/g, '<br>')}</div>`,
                            attachments
                        });
                        results.push({ email: customer.email, status });
                    }
                }

                logAudit('SEND_EMAIL_NOTIFICATION', {
                    recipientCount: customers.length,
                    successCount: results.filter(r => r.status).length
                });

                return {
                    success: true,
                    sent_count: results.filter(r => r.status).length,
                    results
                };
            } else if (type === 'whatsapp') {
                let finalMessage = message;
                let uploadedImageUrl = null;

                if (image_data) {
                    try {
                        const fileName = await this._saveBase64File(image_data, 'whatsapp_image');
                        uploadedImageUrl = `${baseUrl}/uploads/notifications/${fileName}`;
                        finalMessage = `${uploadedImageUrl}\n\n${message}`;
                    } catch (err) {
                        console.error('Failed to save whatsapp image:', err);
                    }
                }

                logAudit('SEND_WHATSAPP_NOTIFICATION', {
                    recipientCount: customers.length,
                    hasImage: !!image_data,
                    imageUrl: uploadedImageUrl
                });

                return {
                    success: true,
                    sent_count: customers.length,
                    message: 'WhatsApp notification prepared.',
                    imageUrl: uploadedImageUrl,
                    finalMessage: finalMessage
                };
            }

            return { success: false, message: 'Unsupported notification type' };
        } catch (error) {
            console.error('Error in sendNotification:', error);
            throw error;
        }
    }

    /**
     * Helper to save base64 to file
     */
    async _saveBase64File(base64Data, prefix = 'file') {
        try {
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error('Invalid base64 string');
            }

            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const extension = type.split('/')[1] || 'bin';
            const fileName = `${prefix}_${uuidv4()}.${extension}`;

            const uploadDir = path.join(__dirname, '../../uploads/notifications');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);

            return fileName;
        } catch (error) {
            console.error('File save error:', error);
            throw error;
        }
    }
}

const logAudit = (action, details) => {
    console.log(`[AUDIT] Action: ${action} | Details: ${JSON.stringify(details)}`);
};

module.exports = new CustomerService();
