'use strict';
const { Payment, Order, Customer, sequelize } = require('../models');
const { Op } = require('sequelize');

class PaymentService {
    /**
     * Generate a unique transaction ID
     */
    generateTransactionId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN${timestamp}${random}`;
    }

    /**
     * Create a new payment
     */
    async createPayment(paymentData) {
        const transaction = await sequelize.transaction();

        try {
            const {
                transaction_id,
                order_id,
                customer_id,
                customer_name,
                amount,
                payment_mode,
                status,
                notes,
                payment_reference
            } = paymentData;

            // Generate transaction ID if not provided
            const txnId = transaction_id || this.generateTransactionId();

            // Validate order if order_id is provided
            if (order_id) {
                const order = await Order.findByPk(order_id);
                if (!order) {
                    throw new Error('Order not found');
                }
            }

            // Validate customer if customer_id is provided
            if (customer_id) {
                const customer = await Customer.findByPk(customer_id);
                if (!customer) {
                    throw new Error('Customer not found');
                }
            }

            const payment = await Payment.create({
                transaction_id: txnId,
                order_id: order_id || null,
                customer_id: customer_id || null,
                customer_name,
                amount: parseFloat(amount),
                payment_mode: payment_mode || 'cash',
                status: status || 'pending',
                notes,
                payment_reference
            }, { transaction });

            await transaction.commit();

            return await this.getPaymentById(payment.id);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get all payments with filters
     */
    async getAllPayments(filters = {}) {
        const {
            status,
            payment_mode,
            customer_id,
            order_id,
            startDate,
            endDate,
            transaction_id,
            customer_name,
            page = 1,
            limit = 50
        } = filters;

        const whereClause = {};

        if (status && status !== 'all') {
            whereClause.status = status;
        }

        if (payment_mode && payment_mode !== 'all') {
            whereClause.payment_mode = payment_mode;
        }

        if (customer_id) {
            whereClause.customer_id = customer_id;
        }

        if (order_id) {
            whereClause.order_id = order_id;
        }

        if (transaction_id) {
            whereClause.transaction_id = { [Op.like]: `%${transaction_id}%` };
        }

        if (customer_name) {
            whereClause.customer_name = { [Op.like]: `%${customer_name}%` };
        }

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            whereClause.createdAt = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            whereClause.createdAt = {
                [Op.lte]: new Date(endDate)
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                { model: Order, as: 'order', required: false },
                { model: Customer, as: 'customer', required: false }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            payments: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId) {
        const payment = await Payment.findByPk(paymentId, {
            include: [
                { model: Order, as: 'order', required: false },
                { model: Customer, as: 'customer', required: false }
            ]
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        return payment;
    }

    /**
     * Get payment by transaction ID
     */
    async getPaymentByTransactionId(transactionId) {
        const payment = await Payment.findOne({
            where: { transaction_id: transactionId },
            include: [
                { model: Order, as: 'order', required: false },
                { model: Customer, as: 'customer', required: false }
            ]
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        return payment;
    }

    /**
     * Get payments for a specific customer
     */
    async getCustomerPayments(customerId) {
        return await Payment.findAll({
            where: { customer_id: customerId },
            include: [
                { model: Order, as: 'order', required: false }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Get payments for a specific order
     */
    async getOrderPayments(orderId) {
        return await Payment.findAll({
            where: { order_id: orderId },
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(paymentId, newStatus) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        // Prevent updating completed/refunded payments
        if (['refunded'].includes(payment.status)) {
            throw new Error(`Cannot update status. Payment is already ${payment.status}`);
        }

        payment.status = newStatus;
        await payment.save();

        return await this.getPaymentById(paymentId);
    }

    /**
     * Update payment details
     */
    async updatePayment(paymentId, updateData) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        const allowedFields = ['status', 'notes', 'payment_reference', 'payment_mode'];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                payment[field] = updateData[field];
            }
        }

        await payment.save();

        return await this.getPaymentById(paymentId);
    }

    /**
     * Delete payment (Soft Delete)
     */
    async deletePayment(paymentId) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        // Soft delete (paranoid is true in model)
        await payment.destroy();
        return { message: 'Payment deleted successfully' };
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats(filters = {}) {
        const { startDate, endDate } = filters;

        const whereClause = {};

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Total revenue (completed payments)
        const completedPayments = await Payment.findAll({
            where: { ...whereClause, status: 'completed' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'completed_count']
            ],
            raw: true
        });

        // Total transactions
        const totalTransactions = await Payment.count({ where: whereClause });

        // Pending payments
        const pendingPayments = await Payment.findAll({
            where: { ...whereClause, status: 'pending' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'pending_amount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'pending_count']
            ],
            raw: true
        });

        // Failed payments
        const failedPayments = await Payment.count({
            where: { ...whereClause, status: 'failed' }
        });

        // Payment mode breakdown
        const paymentModeStats = await Payment.findAll({
            where: { ...whereClause, status: 'completed' },
            attributes: [
                'payment_mode',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['payment_mode'],
            raw: true
        });

        return {
            totalRevenue: parseFloat(completedPayments[0]?.total_revenue || 0),
            totalTransactions,
            completedCount: parseInt(completedPayments[0]?.completed_count || 0),
            pendingAmount: parseFloat(pendingPayments[0]?.pending_amount || 0),
            pendingCount: parseInt(pendingPayments[0]?.pending_count || 0),
            failedCount: failedPayments,
            paymentModeBreakdown: paymentModeStats
        };
    }
}

module.exports = new PaymentService();
