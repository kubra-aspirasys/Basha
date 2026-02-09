'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuItemImage extends Model {
        static associate(models) {
            MenuItemImage.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
        }
    }
    MenuItemImage.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        menu_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        sequelize,
        modelName: 'MenuItemImage',
        tableName: 'menu_item_images',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });
    return MenuItemImage;
};
