const { Inquiry, Quote } = require('./src/models');

const runTest = async () => {
    try {
        console.log('Starting Verification...');

        console.log('Code structure verification:');

        try {
            const inquiryRoutes = require('./src/routes/inquiryRoutes');
            console.log('✅ inquiryRoutes loaded successfully');
        } catch (e) {
            console.error('❌ inquiryRoutes failed to load', e);
        }

        try {
            const inquiryController = require('./src/controllers/inquiryController');
            console.log('✅ inquiryController loaded successfully');
        } catch (e) {
            console.error('❌ inquiryController failed to load', e);
        }

        try {
            const inquiryService = require('./src/services/inquiryService');
            console.log('✅ inquiryService loaded successfully');
        } catch (e) {
            console.error('❌ inquiryService failed to load', e);
        }

        if (Quote) {
            console.log('✅ Quote model loaded successfully from models index');
        } else {
            console.error('❌ Quote model not found in models export');
        }

        if (Inquiry) {
            console.log('✅ Inquiry model loaded successfully from models index');
        } else {
            console.error('❌ Inquiry model not found in models export');
        }

        console.log('Verification Complete.');
        process.exit(0);

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
};

runTest();
