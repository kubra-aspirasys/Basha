'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // FAQs
        await queryInterface.createTable('faqs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            question: { type: Sequelize.TEXT, allowNull: false },
            answer: { type: Sequelize.TEXT, allowNull: false },
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

        // Blog Posts
        await queryInterface.createTable('blog_posts', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            title: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, unique: true, allowNull: false },
            excerpt: { type: Sequelize.TEXT },
            content: { type: Sequelize.TEXT('long'), allowNull: false },
            featured_image_url: { type: Sequelize.STRING },
            author: { type: Sequelize.STRING },
            category: { type: Sequelize.STRING },
            tags: { type: Sequelize.JSON },
            is_published: { type: Sequelize.BOOLEAN, defaultValue: false },
            published_at: { type: Sequelize.DATE },
            views_count: { type: Sequelize.INTEGER, defaultValue: 0 },
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

        // Site Settings
        await queryInterface.createTable('site_settings', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            key: { type: Sequelize.STRING, unique: true, allowNull: false },
            value: { type: Sequelize.TEXT, allowNull: false },
            type: {
                type: Sequelize.ENUM('text', 'image', 'url', 'email', 'phone'),
                defaultValue: 'text'
            },
            category: {
                type: Sequelize.ENUM('branding', 'contact', 'social', 'general'),
                defaultValue: 'general'
            },
            description: { type: Sequelize.TEXT },
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
        await queryInterface.dropTable('site_settings');
        await queryInterface.dropTable('blog_posts');
        await queryInterface.dropTable('faqs');
    }
};
