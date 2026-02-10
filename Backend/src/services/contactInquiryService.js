const { ContactInquiry } = require('../models');
const { Op } = require('sequelize');

const createInquiry = async (data) => {
    return await ContactInquiry.create({
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: data.message,
        event_type: data.eventType,
        guest_count: data.guestCount,
        status: 'Pending'
    });
};

const getAllInquiries = async ({ search, status, eventType, subject, startDate, endDate, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ];
    }

    if (status && status !== 'all') {
        where.status = status;
    }

    if (eventType && eventType !== 'all') {
        where.event_type = eventType;
    }

    if (subject && subject !== 'all') {
        where.subject = subject;
    }

    if (startDate && endDate) {
        where.created_at = {
            [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
        };
    } else if (startDate) {
        where.created_at = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
        where.created_at = { [Op.lte]: new Date(endDate + ' 23:59:59') };
    }

    const { count, rows } = await ContactInquiry.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        paranoid: true
    });

    return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        inquiries: rows
    };
};

const getInquiryById = async (id) => {
    return await ContactInquiry.findByPk(id);
};

const updateInquiry = async (id, data) => {
    const inquiry = await ContactInquiry.findByPk(id);
    if (!inquiry) return null;
    return await inquiry.update(data);
};

const deleteInquiry = async (id) => {
    const inquiry = await ContactInquiry.findByPk(id);
    if (!inquiry) return null;
    await inquiry.destroy();
    return true;
};

module.exports = {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry
};
