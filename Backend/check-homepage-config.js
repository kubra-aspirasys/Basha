'use strict';
const { SiteSetting } = require('./src/models');

async function checkHomepageConfig() {
    try {
        console.log('Checking site_settings for homepage_config...');
        const setting = await SiteSetting.findOne({ where: { key: 'homepage_config' } });
        
        if (setting) {
            console.log('homepage_config found!');
            console.log('Value:', setting.value);
        } else {
            console.log('homepage_config NOT found in database.');
            
            // List all keys to see what's there
            const allSettings = await SiteSetting.findAll();
            console.log('Available keys in site_settings:', allSettings.map(s => s.key));
        }
    } catch (error) {
        console.error('Error checking homepage config:', error);
    } finally {
        process.exit();
    }
}

checkHomepageConfig();
