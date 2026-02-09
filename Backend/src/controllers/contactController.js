const contactService = require('../services/contactService');
const { createContactSchema } = require('../validators/contactValidator');

const submitContactForm = async (req, res, next) => {
    try {
        const { error, value } = createContactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const message = await contactService.createContactMessage(value);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitContactForm
};
