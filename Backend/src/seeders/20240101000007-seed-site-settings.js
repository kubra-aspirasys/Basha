'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const homepage_config = {
            hero: {
                enabled: true,
                video_url: "/Videos/hero.mp4",
                tagline: "Spiced to Perfection, Served with Tradition!",
                logo_url: "https://bashafood.in/Images/KING%20OF%20ALL%20FOOD.webp",
                description: "Experience the rich taste of traditional Hyderabad cuisine with our signature BBQ kababs, wraps, and desserts.",
                button_text: "Order Now"
            },
            about: {
                enabled: true,
                image_url: "/AboutTikka.png",
                badge: "About Us",
                title_line1: "Authentic Hyderabad",
                title_line2: "Biryani & BBQ",
                description: "A savory haven for food lovers offering meticulously crafted dishes bursting with authentic Hyderabad flavors. From our signature BBQ kebabs to our aromatic biryanis, every dish tells a story of tradition and taste.",
                feature1_title: "Fast Service",
                feature1_desc: "Quick delivery within 30 minutes",
                feature2_title: "Quality Food",
                feature2_desc: "Fresh ingredients daily",
                button_text: "View Menu"
            },
            heritage: {
                enabled: true,
                title: "Hydrabad Chicken Biryani",
                video_url: "/Videos/hero.mp4",
                text_block1: "Hydrabad biryani (also known as Hydrabad dum biryani) originated from Golconda, Telangana India, made with basmati rice and meat.",
                text_block2: "Originating in the kitchens of the Qutub Shahi Kingdom. It combines the elements of Hydrabad and later on the Great Mughalai Cuisines.",
                text_block3: "Hydrabad biryani is a key dish flourished During the period of the 6th Nizam of Hydrabad Sir Mir Mehboob Ali Khan Asaf Jah and it is so famous that the dish is considered the city's signature dish.",
                charminar_image: "/charminar.webp",
                nizam_image: "/nizam.webp"
            },
            menu: {
                enabled: true,
                badge: "Our Menu",
                title: "Explore Our Delicious Menu",
                description: "Choose from our wide range of authentic Hyderabad dishes"
            },
            features: {
                enabled: true,
                list: [
                    { icon: 'Clock', title: 'Fast Delivery', desc: 'Quick takeaway and delivery within 30 minutes' },
                    { icon: 'Phone', title: 'Easy Ordering', desc: 'Order online or call us at 70109 33658' },
                    { icon: 'MapPin', title: 'Find Us', desc: 'Kaka Chandamiyan Street, Ambur' }
                ]
            },
            cta: {
                enabled: true,
                stroke_title: "Biryani @ Basha",
                tagline: "ORDER........ EAT........ REPEAT",
                button_text: "Order Now"
            }
        };

        // Clean existing settings
        await queryInterface.bulkDelete('site_settings', {
            key: [
                'homepage_config',
                'contact_title',
                'contact_description',
                'contact_address',
                'contact_phone',
                'contact_email',
                'contact_opening_hours'
            ]
        });

        return queryInterface.bulkInsert('site_settings', [
            {
                id: uuidv4(),
                key: 'homepage_config',
                value: JSON.stringify(homepage_config),
                type: 'json',
                category: 'general',
                description: 'Complete configuration for Homepage sections',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                key: 'contact_title',
                value: 'Get in Touch',
                type: 'text',
                category: 'contact',
                description: 'Title for contact page',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                key: 'contact_description',
                value: "Have a question, feedback, or want to place a bulk order? We'd love to hear from you. Fill out the form below or reach out to us directly.",
                type: 'text',
                category: 'contact',
                description: 'Description for contact page',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                key: 'contact_address',
                value: 'Next Street to Ambur Court,\nNear Old State Bank,\nKaka Chandamiyan Street,\nAmbur 635 802',
                type: 'text',
                category: 'contact',
                description: 'Physical store address',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                key: 'contact_phone',
                value: '70109 33658',
                type: 'text',
                category: 'contact',
                description: 'Primary contact phone number',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                key: 'contact_email',
                value: 'info@bashabiryani.com',
                type: 'text',
                category: 'contact',
                description: 'Primary contact email address',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                key: 'contact_opening_hours',
                value: '11:00 AM - 10:00 PM',
                type: 'text',
                category: 'contact',
                description: 'Store opening hours',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('site_settings', null, {});
    }
};
