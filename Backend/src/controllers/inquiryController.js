const inquiryService = require('../services/inquiryService');
const { createInquirySchema, updateInquirySchema, statusUpdateSchema, priorityUpdateSchema, createQuoteSchema } = require('../validators/inquiryValidator');

const createInquiry = async (req, res) => {
    try {
        const { error, value } = createInquirySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const inquiry = await inquiryService.createInquiry(value);
        res.status(201).json({ success: true, message: 'Inquiry created successfully', data: inquiry });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getAllInquiries = async (req, res) => {
    try {
        const result = await inquiryService.getAllInquiries(req.query);
        res.json({ success: true, message: 'Inquiries fetched successfully', data: result });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getInquiryById = async (req, res) => {
    try {
        const inquiry = await inquiryService.getInquiryById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Inquiry fetched successfully', data: inquiry });
    } catch (error) {
        console.error('Error fetching inquiry:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateInquiry = async (req, res) => {
    try {
        const { error, value } = updateInquirySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const updatedInquiry = await inquiryService.updateInquiry(req.params.id, value);
        if (!updatedInquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Inquiry updated successfully', data: updatedInquiry });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateInquiryStatus = async (req, res) => {
    try {
        const { error, value } = statusUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const updatedInquiry = await inquiryService.updateInquiry(req.params.id, { status: value.status });
        if (!updatedInquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Status updated successfully', data: updatedInquiry });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateInquiryPriority = async (req, res) => {
    try {
        const { error, value } = priorityUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const updatedInquiry = await inquiryService.updateInquiry(req.params.id, { priority: value.priority });
        if (!updatedInquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Priority updated successfully', data: updatedInquiry });
    } catch (error) {
        console.error('Error updating priority:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const deleteInquiry = async (req, res) => {
    try {
        const success = await inquiryService.deleteInquiry(req.params.id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await inquiryService.getInquiryStats();
        res.json({ success: true, message: 'Stats fetched successfully', data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const createQuote = async (req, res) => {
    try {
        const { error, value } = createQuoteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const quote = await inquiryService.createQuote(value);
        res.status(201).json({ success: true, message: 'Quote created successfully', data: quote });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getQuotes = async (req, res) => {
    try {
        const { inquiryId } = req.query;
        if (!inquiryId) {
            return res.status(400).json({ success: false, message: 'Inquiry ID is required' });
        }
        const quotes = await inquiryService.getQuotesByInquiryId(inquiryId);
        res.json({ success: true, message: 'Quotes fetched successfully', data: quotes });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const exportInquiries = async (req, res) => {
    try {
        const csv = await inquiryService.exportInquiries(req.query);
        res.header('Content-Type', 'text/csv');
        res.attachment('inquiries.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting inquiries:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    updateInquiryStatus,
    updateInquiryPriority,
    deleteInquiry,
    getStats,
    createQuote,
    getQuotes,
    exportInquiries
};
