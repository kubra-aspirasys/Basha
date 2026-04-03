const { SiteSetting, sequelize } = require('./src/models');

async function checkConfig() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        const setting = await SiteSetting.findOne({ where: { key: 'homepage_config' } });
        if (setting) {
            console.log('Homepage Config found:');
            console.log(JSON.stringify(JSON.parse(setting.value), null, 2));
        } else {
            console.log('Homepage Config not found in database.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkConfig();
