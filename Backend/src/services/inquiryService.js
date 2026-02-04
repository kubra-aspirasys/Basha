const { Inquiry, Quote, sequelize } = require('../models');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');

// Audit Log Placeholder - assume a shared audit function exists or we log to console/db
// In a real app, this would be `await AuditLog.create(...)`
const logAudit = (action, details, user = 'system') => {
    console.log(`[AUDIT] Action: ${action} | User: ${user} | Details: ${JSON.stringify(details)}`);
};

const createInquiry = async (data) => {
    const inquiry = await Inquiry.create(data);
    logAudit('CREATE_INQUIRY', { inquiryId: inquiry.id });
    return inquiry;
};

const getAllInquiries = async ({ search, status, priority, sort, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        where[Op.or] = [
            { full_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
        ];
    }

    if (status && status !== 'all') {
        where.status = status;
    }

    if (priority && priority !== 'all') {
        where.priority = priority;
    }

    let order = [['created_at', 'DESC']]; // Default sort
    if (sort) {
        if (sort === 'created_at_asc') order = [['created_at', 'ASC']];
        else if (sort === 'created_at_desc') order = [['created_at', 'DESC']];
        // Add more sort options as needed based on UI
    }

    const { count, rows } = await Inquiry.findAndCountAll({
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
        inquiries: rows
    };
};

const getInquiryById = async (id) => {
    return await Inquiry.findByPk(id, {
        include: [{ model: Quote, as: 'quotes' }]
    });
};

const updateInquiry = async (id, data) => {
    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) return null;

    // Capture old values for audit diff (simplified)
    const oldStatus = inquiry.status;
    const oldPriority = inquiry.priority;

    await inquiry.update(data);

    if (data.status && data.status !== oldStatus) {
        logAudit('UPDATE_STATUS', { inquiryId: id, old: oldStatus, new: data.status });
    }
    if (data.priority && data.priority !== oldPriority) {
        logAudit('UPDATE_PRIORITY', { inquiryId: id, old: oldPriority, new: data.priority });
    }

    return inquiry;
};

const deleteInquiry = async (id) => {
    const inquiry = await Inquiry.findByPk(id);
    if (!inquiry) return null;
    await inquiry.destroy();
    logAudit('DELETE_INQUIRY', { inquiryId: id });
    return true;
};

const getInquiryStats = async () => {
    const total = await Inquiry.count();
    const newCount = await Inquiry.count({ where: { status: 'new' } });
    const quotedCount = await Inquiry.count({ where: { status: 'quoted' } });
    const convertedCount = await Inquiry.count({ where: { status: 'converted' } });
    const totalQuoteValue = await Inquiry.sum('quote_amount') || 0;

    return {
        total,
        newCount,
        quotedCount,
        convertedCount,
        totalQuoteValue
    };
};

const createQuote = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const quote = await Quote.create(data, { transaction });

        const inquiry = await Inquiry.findByPk(data.inquiry_id, { transaction });
        if (inquiry) {
            await inquiry.update({
                status: 'quoted',
                quote_amount: data.amount
            }, { transaction });
        }

        await transaction.commit();
        logAudit('CREATE_QUOTE', { inquiryId: data.inquiry_id, amount: data.amount });
        return quote;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getQuotesByInquiryId = async (inquiryId) => {
    return await Quote.findAll({ where: { inquiry_id: inquiryId }, order: [['created_at', 'DESC']] });
};

const exportInquiries = async (filters) => {
    // Re-use getAllInquiries logic but without pagination for export
    const { inquiries } = await getAllInquiries({ ...filters, limit: 10000, page: 1 });

    const fields = [
        'id', 'full_name', 'email', 'phone', 'event_type', 'event_date',
        'guest_count', 'status', 'priority', 'quote_amount', 'created_at'
    ];
    const opts = { fields };

    try {
        const plainInquiries = inquiries.map(i => i.get({ plain: true }));
        const parser = new Parser(opts);
        const csv = parser.parse(plainInquiries);
        return csv;
    } catch (err) {
        console.error(err);
        throw new Error('CSV Export Failed');
    }
};

module.exports = {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry,
    getInquiryStats,
    createQuote,
    getQuotesByInquiryId,
    exportInquiries
};
