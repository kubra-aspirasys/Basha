const contactInquiryService = require('../services/contactInquiryService');
const { createContactInquirySchema, updateContactInquiryAdminSchema } = require('../validators/contactInquiryValidator');

const submitInquiry = async (req, res, next) => {
    try {
        const { error, value } = createContactInquirySchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const inquiry = await contactInquiryService.createInquiry(value);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully. Our team will contact you soon.',
            data: inquiry
        });
    } catch (error) {
        next(error);
    }
};

const getAllInquiries = async (req, res, next) => {
    try {
        const result = await contactInquiryService.getAllInquiries(req.query);
        res.json({
            success: true,
            message: 'Inquiries fetched successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getInquiryById = async (req, res, next) => {
    try {
        const inquiry = await contactInquiryService.getInquiryById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Inquiry fetched successfully', data: inquiry });
    } catch (error) {
        next(error);
    }
};

const updateInquiry = async (req, res, next) => {
    try {
        const { error, value } = updateContactInquiryAdminSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const updatedInquiry = await contactInquiryService.updateInquiry(req.params.id, value);
        if (!updatedInquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Inquiry updated successfully', data: updatedInquiry });
    } catch (error) {
        next(error);
    }
};

const deleteInquiry = async (req, res, next) => {
    try {
        const success = await contactInquiryService.deleteInquiry(req.params.id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    deleteInquiry
};
