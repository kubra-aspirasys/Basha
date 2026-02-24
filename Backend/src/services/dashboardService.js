const {
    Order,
    OrderItem,
    MenuItem,
    Payment,
    Customer,
    ContactInquiry,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

class DashboardService {
    async getStats() {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        const [
            totalCustomers,
            totalOrders,
            totalMenuItems,
            totalRevenueResult,
            recentOrders,
            recentInquiries,
            last7DaysOrders,
            ordersByStatusRaw,
            ordersByTypeRaw,
            topSellingItemsRaw,
            todayOrders,
            newCustomersToday,
            pendingPayments
        ] = await Promise.all([
            Customer.count(),
            Order.count(),
            MenuItem.count(),
            Payment.findOne({
                attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
                where: { status: 'completed' },
                raw: true
            }),
            Order.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [{ model: OrderItem, as: 'items' }]
            }),
            ContactInquiry.findAll({
                limit: 5,
                order: [['created_at', 'DESC']]
            }),
            Order.findAll({
                where: { createdAt: { [Op.gte]: sevenDaysAgo } },
                attributes: ['createdAt', 'total_amount']
            }),
            Order.count({
                attributes: ['status'],
                group: ['status']
            }),
            Order.count({
                attributes: ['order_type'],
                group: ['order_type']
            }),
            OrderItem.findAll({
                attributes: ['menu_item_id', [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']],
                include: [{ model: MenuItem, attributes: ['id', 'name', 'price', 'image_url'] }],
                group: ['menu_item_id', 'MenuItem.id'],
                order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
                limit: 5,
                subQuery: false
            }),
            Order.findAll({
                where: { createdAt: { [Op.gte]: startOfDay } },
                order: [['createdAt', 'DESC']]
            }),
            Customer.count({
                where: { createdAt: { [Op.gte]: startOfDay } }
            }),
            Payment.count({
                where: { status: 'pending' }
            })
        ]);

        const totalRevenue = parseFloat(totalRevenueResult?.total || 0);

        // Process Sales Data (Last 7 Days)
        const salesData = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOrders = last7DaysOrders.filter(o => new Date(o.createdAt || o.created_at).toISOString().split('T')[0] === dateStr);
            const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
            salesData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue,
                orders: dayOrders.length,
                rawDate: dateStr
            });
        }
        salesData.reverse();

        // Process Orders by Status
        const ordersByStatus = { pending: 0, confirmed: 0, preparing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 };
        ordersByStatusRaw.forEach(item => {
            if (ordersByStatus.hasOwnProperty(item.status)) ordersByStatus[item.status] = parseInt(item.count, 10);
        });

        // Process Orders by Type
        const ordersByType = { pickup: 0, delivery: 0 };
        ordersByTypeRaw.forEach(item => {
            if (ordersByType.hasOwnProperty(item.order_type)) ordersByType[item.order_type] = parseInt(item.count, 10);
        });

        // Process Top Selling Items
        const topSellingItems = topSellingItemsRaw.map(item => {
            const menuItem = item.MenuItem;
            return {
                id: menuItem?.id,
                name: menuItem?.name,
                price: menuItem?.price,
                image_url: menuItem?.image_url,
                totalSold: parseInt(item.getDataValue('totalSold'), 10)
            };
        }).filter(i => i.id);

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
            topSellingItems,
            todayMetrics: {
                revenue: todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
                ordersCount: todayOrders.length,
                pendingOrders: ordersByStatus.pending,
                newCustomers: newCustomersToday,
                pendingPayments
            },
            todayOrders
        };
    }
}

module.exports = new DashboardService();
