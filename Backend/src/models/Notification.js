'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            // No strict FK associations — reference_id is polymorphic
        }
    }
    Notification.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM(
                'new_order', 'order_status', 'order_cancelled',
                'new_payment', 'payment_failed',
                'new_customer', 'new_inquiry',
                'low_stock', 'system', 'info'
            ),
            allowNull: false,
            defaultValue: 'info'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            defaultValue: 'medium'
        },
        reference_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        reference_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        underscored: true,
        paranoid: true
    });
    return Notification;
};
