const { MenuCategory, MenuItem, MenuType, sequelize } = require('./src/models');

const categoryNames = {
    'kababs': 'Barbeque Kababs',
    'wraps': 'BBQ Chicken Wraps',
    'hotdog': 'BBQ Chicken Hotdog',
    'delicacies': 'Sausy Delicacies',
    'desserts': 'Royal Desserts',
};

const typeNames = {
    'veg': 'Veg',
    'non-veg': 'Non-Veg',
    'egg': 'Egg',
    'vegan': 'Vegan',
};

const mockMenuItems = [
    {
        name: 'Murgh Malai Kabab',
        description: 'Tender chicken marinated in cream and mild spices, grilled to perfection',
        price: 100,
        category_key: 'kababs',
        type_key: 'non-veg',
        image_url: '/MalaiKabab.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 80,
        preparation_time: 20,
        pre_order_time: 1,
        is_available: true,
        is_featured: true,
        featured_priority: 1
    },
    {
        name: 'Chicken Tikka Kabab',
        description: 'Succulent chicken pieces marinated in yogurt and spices, charcoal grilled',
        price: 100,
        category_key: 'kababs',
        type_key: 'non-veg',
        image_url: '/Sheekh.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 80,
        preparation_time: 20,
        pre_order_time: 1,
        is_available: true,
        is_featured: true,
        featured_priority: 2
    },
    {
        name: 'Chicken Haryali Kabab',
        description: 'Green herb marinated chicken kebab with mint and coriander',
        price: 100,
        category_key: 'kababs',
        type_key: 'non-veg',
        image_url: '/HaryaliKabab.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 80,
        preparation_time: 20,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    },
    {
        name: 'Chicken Seekh Kebab',
        description: 'Minced chicken with spices and herbs, molded on skewers and grilled',
        price: 100,
        category_key: 'kababs',
        type_key: 'non-veg',
        image_url: '/ChickenSheek.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 75,
        preparation_time: 20,
        pre_order_time: 1,
        is_available: true,
        is_featured: true,
        featured_priority: 3
    },
    {
        name: 'Chicken Tikka Wrap',
        description: 'Tender chicken tikka wrapped in soft bread with fresh herbs',
        price: 120,
        category_key: 'wraps',
        type_key: 'non-veg',
        image_url: '/TikkaWrap.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 60,
        preparation_time: 15,
        pre_order_time: 1,
        is_available: true,
        is_featured: true,
        featured_priority: 4
    },
    {
        name: 'Sheek Roll',
        description: 'Spiced minced meat wrapped in thin bread',
        price: 120,
        category_key: 'wraps',
        type_key: 'non-veg',
        image_url: '/SheeksRoll.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 50,
        preparation_time: 15,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    },
    {
        name: 'Malai Chicken Wrap',
        description: 'Creamy marinated chicken in soft wrap with fresh vegetables',
        price: 120,
        category_key: 'wraps',
        type_key: 'non-veg',
        image_url: '/MalaiWrap.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 55,
        preparation_time: 15,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    },
    {
        name: 'Haryali Chicken Wrap',
        description: 'Green herb marinated chicken with mint sauce in a wrap',
        price: 120,
        category_key: 'wraps',
        type_key: 'non-veg',
        image_url: '/HaryaliWrap.png',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 50,
        preparation_time: 15,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    },
    {
        name: 'BBQ Chicken Hotdog',
        description: 'Juicy BBQ chicken in a soft hotdog bun with fresh toppings',
        price: 80,
        category_key: 'hotdog',
        type_key: 'non-veg',
        image_url: '/BBQHotdog.png',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 80,
        preparation_time: 10,
        pre_order_time: 1,
        is_available: true,
        is_featured: true,
        featured_priority: 5
    },
    {
        name: 'Chicken Lollipop',
        description: 'Tender chicken drumsticks fried until crispy and golden',
        price: 130,
        category_key: 'delicacies',
        type_key: 'non-veg',
        image_url: '/Lollipop.jpeg',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 15,
        stock_quantity: 70,
        preparation_time: 20,
        pre_order_time: 1,
        is_available: true,
        is_featured: true,
        featured_priority: 6
    },
    {
        name: 'Boneless Chicken Manchurian',
        description: 'Crispy boneless chicken in tangy Manchurian sauce',
        price: 120,
        category_key: 'delicacies',
        type_key: 'non-veg',
        image_url: '/ChickenManchurian.png',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 60,
        preparation_time: 18,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    },
    {
        name: 'Oh My Gourd',
        description: 'A healthy and energetic refreshing pumpkin drink',
        price: 100,
        category_key: 'desserts',
        type_key: 'veg',
        image_url: '/OhMyGourd.png',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 50,
        preparation_time: 10,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    },
    {
        name: 'Almond & Kaddu Ki Kheer',
        description: 'Perfect blend of condensed milk, pumpkin, saffron, khova and sugar, garnished with almonds and pistachios',
        price: 100,
        category_key: 'desserts',
        type_key: 'veg',
        image_url: '/KadduKiKheer.png',
        unit_type: 'piece',
        min_order_qty: 1,
        max_order_qty: 10,
        stock_quantity: 45,
        preparation_time: 15,
        pre_order_time: 1,
        is_available: true,
        is_featured: false
    }
];

const seedMockData = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // 1. Ensure Categories Exist
        console.log('Ensuring Categories exist...');
        const categoryMap = {}; // name -> id

        for (const [key, name] of Object.entries(categoryNames)) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const [category] = await MenuCategory.findOrCreate({
                where: { name: name },
                defaults: {
                    name: name,
                    slug: slug,
                    is_active: true,
                    description: `Category for ${name}`
                }
            });
            categoryMap[key] = category.id;
            console.log(`Category verified: ${name}`);
        }

        // 2. Ensure Types Exist
        console.log('Ensuring Types exist...');
        const typeMap = {}; // key -> id

        for (const [key, name] of Object.entries(typeNames)) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            // Some colors might be missing if relying on defaults, but let's assume they exist or let defaults handle it
            const [type] = await MenuType.findOrCreate({
                where: { name: name },
                defaults: {
                    name: name,
                    slug: slug,
                    color: '#000000' // Default color if creating new
                }
            });
            typeMap[key] = type.id;
            console.log(`Type verified: ${name}`);
        }

        // 3. Seed Menu Items
        console.log('Seeding Menu Items...');
        for (const item of mockMenuItems) {
            const categoryId = categoryMap[item.category_key];
            const typeId = typeMap[item.type_key];

            if (!categoryId) {
                console.warn(`Category ID not found for key: ${item.category_key}. Skipping item: ${item.name}`);
                continue;
            }
            if (!typeId) {
                console.warn(`Type ID not found for key: ${item.type_key}. Skipping item: ${item.name}`);
                continue;
            }

            // Determine is_vegetarian based on type
            const isVegetarian = ['veg', 'vegan'].includes(item.type_key);

            await MenuItem.create({
                name: item.name,
                description: item.description,
                price: item.price,
                category_id: categoryId,
                type_id: typeId,
                image_url: item.image_url,
                unit_type: item.unit_type,
                min_order_qty: item.min_order_qty,
                max_order_qty: item.max_order_qty,
                stock_quantity: item.stock_quantity,
                preparation_time: item.preparation_time,
                pre_order_time: item.pre_order_time,
                is_available: item.is_available,
                is_featured: item.is_featured,
                featured_priority: item.featured_priority || 0,
                is_vegetarian: isVegetarian
            });
            console.log(`Created item: ${item.name}`);
        }

        console.log('Mock Data Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Unable to seed mock data:', error);
        process.exit(1);
    }
};

seedMockData();
