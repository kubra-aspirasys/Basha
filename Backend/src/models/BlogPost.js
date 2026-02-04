'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BlogPost extends Model {
        static associate(models) {
            // define associations here
        }
    }
    BlogPost.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        excerpt: DataTypes.TEXT,
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        featured_image_url: DataTypes.STRING,
        author: DataTypes.STRING,
        category: DataTypes.STRING,
        tags: {
            type: DataTypes.TEXT,
            get() {
                const rawValue = this.getDataValue('tags');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('tags', JSON.stringify(value));
            }
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        published_at: DataTypes.DATE,
        views_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'BlogPost',
        tableName: 'blog_posts',
        underscored: true,
        timestamps: true
    });
    return BlogPost;
};
