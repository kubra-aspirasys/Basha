'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ContentPage extends Model {
        static associate(models) {
            // define associations here
        }
    }
    ContentPage.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        page_key: DataTypes.STRING,
        title: DataTypes.STRING,
        content: DataTypes.TEXT,
        meta_title: DataTypes.STRING,
        meta_description: DataTypes.TEXT,
        is_published: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'ContentPage',
        tableName: 'content_pages',
        underscored: true,
        timestamps: true
    });
    return ContentPage;
};
