const { SiteSetting } = require('./src/models');
const { v4: uuidv4 } = require('uuid');

async function test() {
    try {
        const key = 'test_persistence_' + Date.now();
        console.log('Testing persistence with key:', key);

        await SiteSetting.create({
            id: uuidv4(),
            key: key,
            value: 'persisted',
            type: 'text',
            category: 'test'
        });

        console.log('Record created.');

        const found = await SiteSetting.findOne({ where: { key } });
        if (found) {
            console.log('Record found successfully!');
        } else {
            console.log('Record NOT found!');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
