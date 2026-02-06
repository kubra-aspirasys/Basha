const {
    Order,
    OrderItem,
    MenuItem,
    Payment,
    Customer,
    Inquiry,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

class DashboardService {
    async getStats() {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        // 1. Basic Counts
        const [
            totalCustomers,
            totalOrders,
            totalMenuItems,
            completedPayments
        ] = await Promise.all([
            Customer.count(),
            Order.count(),
            MenuItem.count(),
            Payment.findAll({
                attributes: ['amount'],
                where: { status: 'completed' }
            })
        ]);

        const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        // 2. Recent Orders
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
                { model: OrderItem, as: 'items' }
            ]
        });

        // 3. Recent Inquiries
        const recentInquiries = await Inquiry.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        // 4. Sales Data (Last 7 Days)
        const last7DaysOrders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            attributes: ['createdAt', 'total_amount']
        });

        // Process sales data in JS to ensure all days are represented (even 0 sales)
        const salesData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Filter orders for this day (comparing YYYY-MM-DD)
            const dayOrders = last7DaysOrders.filter(o => {
                const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
                return orderDate === dateStr;
            });

            const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

            salesData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue,
                orders: dayOrders.length,
                rawDate: dateStr // helpful for sorting if needed
            });
        }
        salesData.reverse(); // Show oldest to newest

        // 5. Orders by Status
        const ordersByStatusRaw = await Order.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
            group: ['status']
        });

        const ordersByStatus = {
            pending: 0,
            confirmed: 0,
            preparing: 0,
            out_for_delivery: 0,
            delivered: 0,
            cancelled: 0
        };

        ordersByStatusRaw.forEach(item => {
            const status = item.getDataValue('status');
            const count = item.getDataValue('count');
            if (ordersByStatus.hasOwnProperty(status)) {
                ordersByStatus[status] = parseInt(count, 10);
            }
        });

        // 6. Orders by Type
        const ordersByTypeRaw = await Order.findAll({
            attributes: ['order_type', [sequelize.fn('COUNT', sequelize.col('order_type')), 'count']],
            group: ['order_type']
        });

        const ordersByType = {
            pickup: 0,
            delivery: 0
        };

        ordersByTypeRaw.forEach(item => {
            const type = item.getDataValue('order_type');
            const count = item.getDataValue('count');
            if (ordersByType.hasOwnProperty(type)) {
                ordersByType[type] = parseInt(count, 10);
            }
        });

        // 7. Top Selling Items
        // This is complex to do purely in sequelize without knowing the exact DB dialect quirks for grouping by association
        // We will fetch aggregated OrderItems and then fetch names.
        const topItemsRaw = await OrderItem.findAll({
            attributes: [
                'menu_item_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']
            ],
            group: ['menu_item_id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5
        });

        const topSellingItems = await Promise.all(topItemsRaw.map(async (item) => {
            const menuItemId = item.menu_item_id;
            const totalSold = parseInt(item.getDataValue('totalSold'), 10);
            const menuItem = await MenuItem.findByPk(menuItemId);

            if (!menuItem) return null;

            return {
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                image_url: menuItem.image_url,
                totalSold
            };
        }));

        // Filter out nulls (deleted items)
        const validTopSellingItems = topSellingItems.filter(i => i !== null);


        // 8. Today's Metrics
        const todayStr = new Date().toISOString().split('T')[0];

        // We can reuse logic or fetch specifically for today for better performance if needed.
        // For simplicity, let's query again efficiently.
        const todayOrders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startOfDay
                }
            }
        });

        const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        const newCustomersToday = await Customer.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfDay
                }
            }
        });
        const pendingPayments = await Payment.count({ where: { status: 'pending' } });
        const pendingOrders = ordersByStatus.pending;


        return {
            totalCustomers,
            totalOrders,
            totalRevenue,
            totalMenuItems,
            recentOrders,
            recentInquiries,
            salesData,
            ordersByStatus,
            ordersByType,
            topSellingItems: validTopSellingItems,
            todayMetrics: {
                revenue: todayRevenue,
                ordersCount: todayOrders.length,
                pendingOrders,
                newCustomers: newCustomersToday,
                pendingPayments
            },
            todayOrders // For the schedule view
        };
    }
}

module.exports = new DashboardService();
