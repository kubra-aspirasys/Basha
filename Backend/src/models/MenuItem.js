'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuItem extends Model {
        static associate(models) {
            MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'category_id', as: 'category' });
            MenuItem.belongsTo(models.MenuType, { foreignKey: 'type_id', as: 'type' }); // Changed to MenuType to match existing db
            // Verify if OrderItem and other relations exist before associating
            if (models.OrderItem) MenuItem.hasMany(models.OrderItem, { foreignKey: 'menu_item_id' });
            if (models.UserFavorite) MenuItem.hasMany(models.UserFavorite, { foreignKey: 'menu_item_id' });
            if (models.Review) MenuItem.hasMany(models.Review, { foreignKey: 'menu_item_id' });
            MenuItem.hasMany(models.MenuItemImage, { foreignKey: 'menu_item_id', as: 'images' });
        }
    }
    MenuItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        category_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        type_id: {
            type: DataTypes.UUID,
            allowNull: true, // Product Type ID
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        unit_type: {
            type: DataTypes.STRING, // kg, piece, liter, plate
            allowNull: false,
            defaultValue: 'piece',
        },
        min_order_qty: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        max_order_qty: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.TEXT, // Changed from STRING to TEXT to support long URLs
            allowNull: true,
        },
        is_vegetarian: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        featured_priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            allowNull: true, // Null means unlimited
        },
        preparation_time: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: true,
        },
        pre_order_time: {
            type: DataTypes.INTEGER, // in hours, required advance notice
            allowNull: true,
        },
        offer_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        offer_discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: true,
        },
        offer_discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        discounted_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'MenuItem',
        tableName: 'menu_items',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });
    return MenuItem;
};
