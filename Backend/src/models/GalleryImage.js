'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GalleryImage extends Model {
        static associate(models) {
            // define associations here
        }
    }
    GalleryImage.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        image_url: DataTypes.STRING,
        alt_text: DataTypes.STRING,
        category: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN,
        display_order: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'GalleryImage',
        tableName: 'gallery_images',
        underscored: true,
        timestamps: true
    });
    return GalleryImage;
};
