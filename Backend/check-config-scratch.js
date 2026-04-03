const db = require('./src/models');

async function checkSiteSetting() {
    try {
        const setting = await db.SiteSetting.findOne({ where: { key: 'homepage_config' } });
        if (setting) {
            console.log('Homepage Config:', JSON.stringify(JSON.parse(setting.value), null, 2));
        } else {
            console.log('Homepage config not found in DB');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkSiteSetting();
