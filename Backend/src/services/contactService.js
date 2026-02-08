const { ContactMessage } = require('../models');

const createContactMessage = async (data) => {
    // Basic service function to create a record
    // In a real app, this might also trigger an email notification

    // Combine additional fields into message if provided
    let finalMessage = data.message;
    if (data.eventType || data.eventDate || data.guestCount) {
        finalMessage += `\n\n--- Additional Details ---\n`;
        if (data.eventType) finalMessage += `Event Type: ${data.eventType}\n`;
        if (data.eventDate) finalMessage += `Event Date: ${data.eventDate}\n`;
        if (data.guestCount) finalMessage += `Guest Count: ${data.guestCount}\n`;
    }

    const message = await ContactMessage.create({
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: finalMessage
    });
    return message;
};

module.exports = {
    createContactMessage
};
