'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuItem extends Model {
        static associate(models) {
            MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'category_id', as: 'category' });
            MenuItem.belongsTo(models.MenuType, { foreignKey: 'type_id', as: 'type' });
            MenuItem.hasMany(models.OrderItem, { foreignKey: 'menu_item_id', as: 'order_items' });
        }
    }
    MenuItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        price: DataTypes.DECIMAL(10, 2),
        category_id: DataTypes.UUID,
        type_id: DataTypes.UUID,
        unit_type: DataTypes.STRING,
        min_order_qty: DataTypes.INTEGER,
        max_order_qty: DataTypes.INTEGER,
        stock_quantity: DataTypes.INTEGER,
        preparation_time: DataTypes.INTEGER,
        pre_order_time: DataTypes.INTEGER,
        is_available: DataTypes.BOOLEAN,
        is_featured: DataTypes.BOOLEAN,
        featured_priority: DataTypes.INTEGER,
        offer_code: DataTypes.STRING,
        offer_discount_type: DataTypes.ENUM('percentage', 'fixed'),
        offer_discount_value: DataTypes.DECIMAL(10, 2),
        discounted_price: DataTypes.DECIMAL(10, 2),
        image_url: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'MenuItem',
        tableName: 'menu_items',
        underscored: true,
        paranoid: true
    });
    return MenuItem;
};
