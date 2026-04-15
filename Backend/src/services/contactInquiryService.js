const { ContactInquiry } = require('../models');
const { Op } = require('sequelize');
const { sanitizeObject } = require('../utils/sanitizer');

const createInquiry = async (data) => {
    const sanitizedData = sanitizeObject(data);
    return await ContactInquiry.create({
        name: sanitizedData.name,
        phone: sanitizedData.phone,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        event_type: sanitizedData.eventType,
        guest_count: sanitizedData.guestCount,
        status: 'Pending'
    });
};

const getAllInquiries = async ({ search, status, eventType, subject, startDate, endDate, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        const searchTerm = search.trim();
        where[Op.or] = [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { phone: { [Op.like]: `%${searchTerm}%` } },
            { email: { [Op.like]: `%${searchTerm}%` } }
        ];
    }

    if (status && status !== 'all') {
        where.status = status;
    }

    if (eventType && eventType !== 'all') {
        where.event_type = eventType;
    }

    if (subject && subject !== 'all') {
        // Use LIKE for subject to handle minor differences if strict equality fails,
        // but for now strict equality is safer for exact filtering unless we know it varies.
        // Given the bug report, let's keep it strict but ensure we match what front-end sends.
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

const bulkDeleteInquiries = async (ids) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('No inquiry IDs provided for deletion');
    }
    const result = await ContactInquiry.destroy({
        where: {
            id: {
                [Op.in]: ids
            }
        }
    });
    return result;
};

module.exports = {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry,
    bulkDeleteInquiries
};
