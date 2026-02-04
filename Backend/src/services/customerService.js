const { Customer, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

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
        let orderClause = [[sort, order.toUpperCase()]];
        if (sort === 'total_spent') {
            // Complex sort requiring subquery or separate handling - simplified for now to standard fields
            // For MVP strict adherence, we might need to sort in memory or join. 
            // Since we can't easily join on sum without grouping, we will stick to standard column sorting for SQL
            // or perform a special finding strategy.
            // Let's default to created_at if complex sort is requested for this iteration unless we implement subqueries
            // Changing strategy: simple columns only for SQL sort to start.
            if (sort !== 'total_spent') {
                orderClause = [[sort, order.toUpperCase()]];
            } else {
                orderClause = [['createdAt', order.toUpperCase()]]; // Fallback
            }
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
        if (sort === 'total_spent') {
            enrichedRows.sort((a, b) => {
                return order.toUpperCase() === 'DESC'
                    ? b.total_spent - a.total_spent
                    : a.total_spent - b.total_spent;
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

    /**
     * Mock Send Notification
     */
    async sendNotification(data) {
        // In a real app, integrate with Twilio/SendGrid here
        // For now, we mock success
        console.log('Sending notification:', data);
        return {
            success: true,
            sent_count: data.customers.length
        };
    }
}

module.exports = new CustomerService();
