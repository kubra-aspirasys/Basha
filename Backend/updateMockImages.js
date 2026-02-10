const { MenuItem, sequelize } = require('./src/models');

const mockImages = {
    'Murgh Malai Kabab': '/uploads/MalaiKabab.jpeg',
    'Chicken Tikka Kabab': '/uploads/Sheekh.jpeg',
    'Chicken Haryali Kabab': '/uploads/HaryaliKabab.jpeg',
    'Chicken Seekh Kebab': '/uploads/ChickenSheek.jpeg',
    'Chicken Tikka Wrap': '/uploads/TikkaWrap.jpeg',
    'Sheek Roll': '/uploads/SheeksRoll.jpeg',
    'Malai Chicken Wrap': '/uploads/MalaiWrap.jpeg',
    'Haryali Chicken Wrap': '/uploads/HaryaliWrap.png',
    'BBQ Chicken Hotdog': '/uploads/BBQHotdog.png',
    'Chicken Lollipop': '/uploads/Lollipop.jpeg',
    'Boneless Chicken Manchurian': '/uploads/ChickenManchurian.png',
    'Oh My Gourd': '/uploads/OhMyGourd.png',
    'Almond & Kaddu Ki Kheer': '/uploads/KadduKiKheer.png'
};

const updateImages = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        console.log('Updating images...');
        for (const [name, url] of Object.entries(mockImages)) {
            const [updatedRows] = await MenuItem.update(
                { image_url: url },
                { where: { name: name } }
            );

            if (updatedRows > 0) {
                console.log(`Updated image for: ${name} -> ${url}`);
            } else {
                console.log(`Item not found or already up to date: ${name}`);
            }
        }

        console.log('Image update completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to update images:', error);
        process.exit(1);
    }
};

updateImages();
