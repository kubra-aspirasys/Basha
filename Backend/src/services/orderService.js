const { Order, OrderItem, MenuItem, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

class OrderService {
    /**
     * Create a new order for a customer
     */
    async createOrder(customerId, orderData) {
        const transaction = await sequelize.transaction();

        try {
            const {
                items, // Array of { menu_item_id, quantity }
                delivery_address,
                customer_name,
                customer_phone,
                order_type,
                payment_method
            } = orderData;

            // 1. Calculate totals and validate items
            let subtotal = 0;
            const orderItemsData = [];

            for (const item of items) {
                const menuItem = await MenuItem.findByPk(item.menu_item_id);

                if (!menuItem) {
                    throw new Error(`Menu item not found: ${item.menu_item_id}`);
                }

                if (!menuItem.is_available) {
                    throw new Error(`Menu item is not available: ${menuItem.name}`);
                }

                const price = parseFloat(menuItem.discounted_price || menuItem.price);
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;

                orderItemsData.push({
                    menu_item_id: menuItem.id,
                    menu_item_name: menuItem.name,
                    quantity: item.quantity,
                    price: price
                });
            }

            // 2. Calculate charges
            const serviceCharges = 0; // standard logic, can be config based
            const deliveryCharges = order_type === 'delivery' ? 50 : 0; // Example fixed charge, can be dynamic
            const gstAmount = subtotal * 0.05; // 5% GST example
            const totalAmount = subtotal + gstAmount + serviceCharges + deliveryCharges;

            // 3. Create Order
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const order = await Order.create({
                order_number: orderNumber,
                customer_id: customerId || null, // Allow null for guest orders
                customer_name,
                customer_phone,
                delivery_address,
                subtotal,
                gst_amount: gstAmount,
                delivery_charges: deliveryCharges,
                service_charges: serviceCharges,
                total_amount: totalAmount,
                status: 'pending',
                order_type,
                payment_method: payment_method || 'cod'
            }, { transaction });

            // 4. Create Order Items
            const itemsWithOrderId = orderItemsData.map(item => ({
                ...item,
                order_id: order.id
            }));

            await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

            // 5. Create Payment Record (Pending)
            const paymentModeMap = {
                'cod': 'cash',
                'online': 'upi' // Defaulting online to UPI for now, or could vary
            };

            await Payment.create({
                transaction_id: `TXN-${order.order_number}`, // Temporary transaction ID
                order_id: order.id,
                customer_id: customerId || null,
                customer_name: customer_name,
                amount: totalAmount,
                payment_mode: paymentModeMap[payment_method] || 'cash',
                status: 'pending',
                notes: 'Payment initialized with order creation'
            }, { transaction });

            await transaction.commit();
            return await this.getOrderDetails(order.id);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get all orders (Admin) with filters
     */
    async getAllOrders(filters = {}) {
        const { status, startDate, endDate, customer_id, order_number } = filters;
        const whereClause = {};

        if (status) whereClause.status = status;
        if (customer_id) whereClause.customer_id = customer_id;
        if (order_number) whereClause.order_number = { [Op.like]: `%${order_number}%` };

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        return await Order.findAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'items' }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Get orders for a specific customer
     */
    async getCustomerOrders(customerId) {
        return await Order.findAll({
            where: { customer_id: customerId },
            include: [
                { model: OrderItem, as: 'items' }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Get single order details
     */
    async getOrderDetails(orderId, customerId = null) {
        const whereClause = { id: orderId };
        // If customerId is provided, ensure the order belongs to them
        if (customerId) {
            whereClause.customer_id = customerId;
        }

        const order = await Order.findOne({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'items' }
            ]
        });

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    /**
     * Update order status (Admin)
     */
    async updateOrderStatus(orderId, newStatus) {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        // Invalid transitions check
        if (order.status === 'delivered' || order.status === 'cancelled') {
            throw new Error(`Cannot update status. Order is already ${order.status}`);
        }

        order.status = newStatus;
        await order.save();
        return order;
    }

    /**
     * Cancel order (Customer)
     */
    async cancelOrder(orderId, customerId) {
        const order = await Order.findOne({
            where: { id: orderId, customer_id: customerId }
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Allowed only if pending or confirmed
        if (!['pending', 'confirmed'].includes(order.status)) {
            throw new Error('Order cannot be cancelled at this stage');
        }

        order.status = 'cancelled';
        await order.save();
        return order;
    }

    /**
     * Delete order (Admin - Soft Delete)
     */
    async deleteOrder(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Soft delete (paranoid is true in model)
        await order.destroy();
        return { message: 'Order deleted successfully' };
    }
}

module.exports = new OrderService();
