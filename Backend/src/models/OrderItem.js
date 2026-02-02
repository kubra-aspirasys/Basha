'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
            OrderItem.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id' });
        }
    }
    OrderItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_id: DataTypes.UUID,
        menu_item_id: DataTypes.UUID,
        menu_item_name: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        price: DataTypes.DECIMAL(10, 2)
    }, {
        sequelize,
        modelName: 'OrderItem',
        tableName: 'order_items',
        underscored: true,
        timestamps: true
        // OrderItems usually don't need paranoid/soft delete, but keeping standard timestamps
    });
    return OrderItem;
};
