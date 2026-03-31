const { Order, OrderItem, MenuItem, Payment, Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sanitizeObject, sanitizeString } = require('../utils/sanitizer');

// Status Workflow (Now free use as per user request)
const ALL_STATUSES = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
const ALLOWED_TRANSITIONS = {
    'pending': ALL_STATUSES,
    'confirmed': ALL_STATUSES,
    'preparing': ALL_STATUSES,
    'ready_for_pickup': ALL_STATUSES,
    'out_for_delivery': ALL_STATUSES,
    'delivered': ALL_STATUSES,
    'cancelled': ALL_STATUSES
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
            } = sanitizeObject(orderData);

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

            // 2. Calculate charges from SiteSettings
            const { SiteSetting } = require('../models');
            const [deliverySetting, gstSetting] = await Promise.all([
                SiteSetting.findOne({ where: { key: 'delivery_charges' } }),
                SiteSetting.findOne({ where: { key: 'gst_rate' } })
            ]);

            const deliveryCharges = (order_type === 'delivery') 
                ? parseFloat(deliverySetting?.value || 50) 
                : 0;
            const gstRate = parseFloat(gstSetting?.value || 18) / 100;
            const serviceCharges = 0; 
            
            const taxableAmount = subtotal + deliveryCharges + serviceCharges;
            const gstAmount = taxableAmount * gstRate;

            // Apply discount if coupon provided
            let finalDiscountAmount = 0;
            if (coupon_id && discount_amount) {
                finalDiscountAmount = parseFloat(discount_amount);
            }

            let totalAmount = taxableAmount + gstAmount - finalDiscountAmount;
            if (totalAmount < 0) totalAmount = 0;

            // 3. Create Order
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Default status based on order type
            let defaultStatus = 'pending';
            if (['takeaway', 'swiggy', 'zomato'].includes(order_type)) {
                defaultStatus = 'confirmed';
            }

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
                status: orderData.status || defaultStatus,
                order_type,
                payment_method: payment_method || 'cod'
            }, { transaction });

            // Record Used Coupon if applicable
            if (coupon_id && discount_amount > 0) {
                const { UsedCoupon, Offer } = require('../models');
                await UsedCoupon.create({
                    order_id: order.id, // Using the just created order ID
                    offer_id: coupon_id,
                    customer_id: customerId || null,
                    discount_amount: discount_amount
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

            const paymentModeMap = {
                'cod': 'cash',
                'online': 'upi'
            };

            if (payment_method === 'online') {
                throw new Error('Online payment is temporarily unavailable. Please use Cash on Delivery.');
            }

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
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        const currentStatus = order.status;

        // If status is same, do nothing
        if (currentStatus === newStatus) {
            return order;
        }

        // Allow free transition between any status
        const allowedNextStatuses = ALL_STATUSES.filter(s => s !== currentStatus);

        if (!ALL_STATUSES.includes(newStatus)) {
            const error = new Error(`Invalid status: '${newStatus}'`);
            error.statusCode = 400;
            throw error;
        }

        order.status = newStatus;
        await order.save();

        // If status moved to preparing or beyond, mark any 'new_order' notifications as read
        const statusesBeyondNew = ['preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
        if (statusesBeyondNew.includes(newStatus)) {
            try {
                const { Notification } = require('../models');
                await Notification.update(
                    { is_read: true },
                    { 
                        where: { 
                            reference_id: order.id,
                            reference_type: 'order',
                            type: 'new_order',
                            is_read: false
                        }
                    }
                );
            } catch (err) {
                console.error('Failed to update notification status:', err);
            }
        }

        // Return full details including items so frontend doesn't lose them
        return await this.getOrderDetails(order.id);
    }

    /**
     * Fully update order details (Admin)
     */
    async updateOrder(orderId, updateData) {
        const transaction = await sequelize.transaction();
        try {
            const order = await Order.findByPk(orderId, { transaction });
            if (!order) {
                const error = new Error('Order not found');
                error.statusCode = 404;
                throw error;
            }

            const {
                customer_name,
                order_type,
                status,
                items
            } = sanitizeObject(updateData);

            if (customer_name) order.customer_name = customer_name;
            if (order_type) order.order_type = order_type;
            if (status) order.status = status;

            if (items && Array.isArray(items) && items.length > 0) {
                let subtotal = 0;
                const orderItemsData = [];

                for (const item of items) {
                    const menuItem = await MenuItem.findByPk(item.menu_item_id);
                    if (!menuItem) throw new Error(`Menu item not found: ${item.menu_item_id}`);

                    const price = parseFloat(menuItem.discounted_price || menuItem.price);
                    subtotal += price * item.quantity;

                    orderItemsData.push({
                        order_id: order.id,
                        menu_item_id: menuItem.id,
                        menu_item_name: menuItem.name,
                        quantity: item.quantity,
                        price: price
                    });
                }

                const serviceCharges = 0;
                const deliveryCharges = order.order_type === 'delivery' ? 50 : 0;
                const gstRate = 0.18;
                const taxableAmount = subtotal + deliveryCharges + serviceCharges;
                const gstAmount = taxableAmount * gstRate;

                // Try to infer existing discount to maintain it
                const oldTaxable = parseFloat(order.subtotal) + parseFloat(order.delivery_charges) + parseFloat(order.service_charges);
                const oldGst = parseFloat(order.gst_amount);
                const oldExpectedTotal = oldTaxable + oldGst;
                const existingDiscount = oldExpectedTotal > parseFloat(order.total_amount) ? oldExpectedTotal - parseFloat(order.total_amount) : 0;

                let totalAmount = taxableAmount + gstAmount - existingDiscount;
                if (totalAmount < 0) totalAmount = 0;

                order.subtotal = subtotal;
                order.gst_amount = gstAmount;
                order.delivery_charges = deliveryCharges;
                order.service_charges = serviceCharges;
                order.total_amount = totalAmount;

                await OrderItem.destroy({ where: { order_id: order.id }, transaction });
                await OrderItem.bulkCreate(orderItemsData, { transaction });

                const payment = await Payment.findOne({ where: { order_id: order.id }, transaction });
                if (payment) {
                    payment.amount = totalAmount;
                    if (customer_name) payment.customer_name = customer_name;
                    await payment.save({ transaction });
                }
            }

            await order.save({ transaction });
            await transaction.commit();

            return await this.getOrderDetails(order.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
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
