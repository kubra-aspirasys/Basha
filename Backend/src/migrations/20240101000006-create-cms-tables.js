'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Inquiries
        await queryInterface.createTable('inquiries', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            full_name: { type: Sequelize.STRING },
            email: { type: Sequelize.STRING },
            phone: { type: Sequelize.STRING },
            event_date: { type: Sequelize.DATEONLY },
            event_type: { type: Sequelize.STRING },
            guest_count: { type: Sequelize.INTEGER },
            additional_details: { type: Sequelize.TEXT },
            status: {
                type: Sequelize.ENUM('new', 'contacted', 'quoted', 'converted', 'closed'),
                defaultValue: 'new'
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high'),
                defaultValue: 'medium'
            },
            assigned_to: { type: Sequelize.STRING }, // Could be FK to users, but keep simple for now
            notes: { type: Sequelize.TEXT },
            quote_amount: { type: Sequelize.DECIMAL(10, 2) },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deleted_at: { type: Sequelize.DATE }
        });

        // CMS - Gallery Images
        await queryInterface.createTable('gallery_images', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            title: { type: Sequelize.STRING },
            description: { type: Sequelize.TEXT },
            image_url: { type: Sequelize.STRING },
            alt_text: { type: Sequelize.STRING },
            category: { type: Sequelize.STRING },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // CMS - Banners (Hero sections etc)
        await queryInterface.createTable('banners', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            title: { type: Sequelize.STRING },
            subtitle: { type: Sequelize.STRING },
            image_url: { type: Sequelize.STRING },
            link_url: { type: Sequelize.STRING },
            link_type: { type: Sequelize.ENUM('none', 'internal', 'external'), defaultValue: 'none' },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            start_date: { type: Sequelize.DATE },
            end_date: { type: Sequelize.DATE },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // CMS - Content Pages (generic pages like About Us)
        await queryInterface.createTable('content_pages', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            page_key: { type: Sequelize.STRING, unique: true }, // e.g., 'about-us'
            title: { type: Sequelize.STRING },
            content: { type: Sequelize.TEXT },
            meta_title: { type: Sequelize.STRING },
            meta_description: { type: Sequelize.TEXT },
            is_published: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('content_pages');
        await queryInterface.dropTable('banners');
        await queryInterface.dropTable('gallery_images');
        await queryInterface.dropTable('inquiries');
    }
};
