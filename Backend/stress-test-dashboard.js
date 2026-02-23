const { Payment, sequelize } = require('./src/models');
const { v4: uuidv4 } = require('uuid');

const seedPayments = async (count) => {
    console.log(`Seeding ${count} payment records...`);
    const batchSize = 1000;
    const batches = Math.ceil(count / batchSize);

    for (let i = 0; i < batches; i++) {
        const payments = [];
        for (let j = 0; j < batchSize && (i * batchSize + j) < count; j++) {
            payments.push({
                id: uuidv4(),
                order_id: null, // Set to null to avoid foreign key constraint
                customer_name: 'Stress Test Customer',
                amount: (Math.random() * 1000).toFixed(2),
                payment_mode: 'card',
                status: 'completed',
                transaction_id: `TXN-${uuidv4()}`,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
        await Payment.bulkCreate(payments);
        if ((i + 1) % 10 === 0) console.log(`Processed ${i + 1} batches...`);
    }
    console.log('✅ Seeding completed.');
};

const runStressTest = async () => {
    try {
        // Now 100k
        await seedPayments(100000);
        console.log('Now run verify-dashboard.js to see impact.');
    } catch (error) {
        console.error('❌ Stress test failed:', error);
    } finally {
        process.exit();
    }
};

runStressTest();
