const { Order, OrderItem, MenuItem, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');

// Define allowed status transitions (Strict Workflow)
const ALLOWED_TRANSITIONS = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready_for_pickup', 'cancelled'],
    'ready_for_pickup': ['out_for_delivery', 'delivered', 'cancelled'], // Delivery -> Out, Pickup -> Delivered
    'out_for_delivery': ['delivered', 'cancelled'],
    'delivered': [], // Terminal status
    'cancelled': []  // Terminal status
};

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
                payment_method,
                coupon_id,
                discount_amount
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
            const gstRate = 0.18; // 18% GST to match frontend
            const taxableAmount = subtotal + deliveryCharges + serviceCharges;
            const gstAmount = taxableAmount * gstRate;

            // Apply discount if coupon provided
            let discountAmount = 0;
            if (coupon_id && discount_amount) {
                // In a robust system, re-validate coupon here.
                // For now, trusting the passed validated amount but capping it
                discountAmount = parseFloat(discount_amount);
            }

            let totalAmount = taxableAmount + gstAmount - discountAmount;
            if (totalAmount < 0) totalAmount = 0;

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

            // Record Used Coupon if applicable
            if (coupon_id && discountAmount > 0) {
                const { UsedCoupon, Offer } = require('../models');
                await UsedCoupon.create({
                    order_id: order.id, // Using the just created order ID
                    offer_id: coupon_id,
                    customer_id: customerId || null,
                    discount_amount: discountAmount
                }, { transaction });

                // If this is a specific offer, we optionally remove the user from the specific_users array
                const offerToUpdate = await Offer.findByPk(coupon_id, { transaction });
                if (offerToUpdate && offerToUpdate.applicable_to === 'specific' && customerId) {
                    const users = offerToUpdate.specific_users || [];
                    const updatedUsers = users.filter(id => id !== customerId);
                    await offerToUpdate.update({ specific_users: updatedUsers }, { transaction });
                }
            }

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
        const { status, startDate, endDate, customer_id, order_number, search } = filters;
        const whereClause = {};

        // Status Filter
        if (status && status !== 'all') {
            whereClause.status = status;
        }

        // Customer ID Filter
        if (customer_id) whereClause.customer_id = customer_id;

        // Search (Order Number OR Customer Name)
        if (search) {
            whereClause[Op.or] = [
                { order_number: { [Op.like]: `%${search}%` } },
                { customer_name: { [Op.like]: `%${search}%` } }
            ];
        } else if (order_number) {
            whereClause.order_number = { [Op.like]: `%${order_number}%` };
        }

        // Date Range Filter
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end day

            whereClause.created_at = {
                [Op.between]: [new Date(startDate), end]
            };
        }

        return await Order.findAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'items' }
            ],
            order: [['created_at', 'DESC']]
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
            order: [['created_at', 'DESC']]
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
     * Update order status (Admin) with STRICT VALIDATION
     */
    async updateOrderStatus(orderId, newStatus) {
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        const currentStatus = order.status;

        // If status is same, do nothing
        if (currentStatus === newStatus) {
            return order;
        }

        // Check if transition is allowed
        const allowedNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

        if (!allowedNextStatuses.includes(newStatus)) {
            throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedNextStatuses.join(', ')}`);
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
