'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
            Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
        }
    }
    Order.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_number: DataTypes.STRING,
        customer_id: DataTypes.UUID,
        customer_name: DataTypes.STRING,
        customer_phone: DataTypes.STRING,
        delivery_address: DataTypes.TEXT,
        total_amount: DataTypes.DECIMAL(10, 2),
        subtotal: DataTypes.DECIMAL(10, 2),
        gst_amount: DataTypes.DECIMAL(10, 2),
        delivery_charges: DataTypes.DECIMAL(10, 2),
        service_charges: DataTypes.DECIMAL(10, 2),
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
            defaultValue: 'pending'
        },
        order_type: {
            type: DataTypes.ENUM('pickup', 'delivery'),
            defaultValue: 'delivery'
        }
    }, {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
        underscored: true,
        paranoid: true
    });
    return Order;
};
