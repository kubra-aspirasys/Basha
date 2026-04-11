require('dotenv').config();
const { SiteSetting } = require('./src/models');

async function seedSettings() {
    const settings = [
        // Contact Details
        {
            key: 'contact_title',
            value: 'Get in Touch',
            type: 'text',
            category: 'contact',
            description: 'Title for the contact page header'
        },
        {
            key: 'contact_description',
            value: 'We value your feedback and inquiries. Reach out to us through any of the channels below.',
            type: 'text',
            category: 'contact',
            description: 'Description text for the contact page header'
        },
        {
            key: 'contact_address',
            value: 'Kaka Chandamiyan Street, Ambur, Tamil Nadu 635802',
            type: 'text',
            category: 'contact',
            description: 'Physical business address'
        },
        {
            key: 'contact_phone',
            value: '+91 70109 33658',
            type: 'text',
            category: 'contact',
            description: 'Primary contact phone number'
        },
        {
            key: 'contact_email',
            value: 'contact@bashafood.in',
            type: 'text',
            category: 'contact',
            description: 'Primary contact email'
        },
        {
            key: 'contact_opening_hours',
            value: '11:00 AM - 10:00 PM',
            type: 'text',
            category: 'contact',
            description: 'Business hours display'
        },

        // Payment & Fulfillment
        {
            key: 'payment_method_delivery',
            value: 'true',
            type: 'boolean',
            category: 'payment',
            description: 'Enable/Disable Home Delivery'
        },
        {
            key: 'payment_method_pickup',
            value: 'true',
            type: 'boolean',
            category: 'payment',
            description: 'Enable/Disable Self Pickup'
        },
        {
            key: 'payment_method_cod',
            value: 'true',
            type: 'boolean',
            category: 'payment',
            description: 'Enable/Disable Cash on Delivery'
        },
        {
            key: 'payment_method_online',
            value: 'false',
            type: 'boolean',
            category: 'payment',
            description: 'Enable/Disable Online Payment'
        },

        // GST & Business Info
        {
            key: 'gst_rate',
            value: '18',
            type: 'number',
            category: 'tax',
            description: 'GST Percentage rate'
        },
        {
            key: 'gst_number',
            value: '29ABCDE1234F1Z5',
            type: 'text',
            category: 'tax',
            description: 'Business GST Number'
        },
        {
            key: 'delivery_charges',
            value: '50',
            type: 'number',
            category: 'payment',
            description: 'Flat delivery fee'
        },
        {
            key: 'service_charges',
            value: '0',
            type: 'number',
            category: 'payment',
            description: 'Additional service fee'
        },
        {
            key: 'business_name',
            value: 'Basha Biriyani',
            type: 'text',
            category: 'business',
            description: 'Official Business Name'
        },
        {
            key: 'business_address',
            value: '123 Main Street, Ambur',
            type: 'text',
            category: 'business',
            description: 'Primary Business Address'
        },

        // Homepage Configuration (Initial Seeding)
        {
            key: 'homepage_config',
            value: JSON.stringify({
                hero: {
                    enabled: true,
                    video_url: "/Videos/hero.mp4",
                    tagline: "Spiced to Perfection, Served with Tradition!",
                    logo_url: "/Images/KING OF ALL FOOD.webp",
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
                    title: "Hyderabad Chicken Biryani",
                    video_url: "/Videos/hero.mp4",
                    text_block1: "Hyderabad biryani originated from Golconda, Telangana India.",
                    text_block2: "Originating in the kitchens of the Qutub Shahi Kingdom.",
                    text_block3: "Hyderabad biryani is a city's signature dish.",
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
                        { title: 'Fast Delivery', desc: 'Quick takeaway and delivery within 30 minutes' },
                        { title: 'Easy Ordering', desc: 'Order online or call us at 70109 33658' },
                        { title: 'Find Us', desc: 'Kaka Chandamiyan Street, Ambur' }
                    ]
                },
                cta: {
                    enabled: true,
                    stroke_title: "Biryani @ Basha",
                    tagline: "ORDER........ EAT........ REPEAT",
                    button_text: "Order Now"
                }
            }),
            type: 'json',
            category: 'general',
            description: 'Full Homepage Configuration'
        }
    ];

    console.log("--- SEEDING SITE SETTINGS ---");
    
    for (const s of settings) {
        const [setting, created] = await SiteSetting.findOrCreate({
            where: { key: s.key },
            defaults: s
        });

        if (!created) {
            console.log(`Setting already exists: ${s.key}`);
        } else {
            console.log(`Created setting: ${s.key}`);
        }
    }

    console.log("--- SEEDING COMPLETED ---");
    process.exit(0);
}

seedSettings().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
