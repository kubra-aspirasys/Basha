'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Payment extends Model {
        static associate(models) {
            Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
            Payment.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
        }
    }

    Payment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        transaction_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'orders',
                key: 'id'
            }
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'customers',
                key: 'id'
            }
        },
        customer_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        payment_mode: {
            type: DataTypes.ENUM('cash', 'upi', 'card', 'netbanking'),
            defaultValue: 'cash'
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
            defaultValue: 'pending'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        payment_reference: {
            type: DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Payment',
        tableName: 'payments',
        underscored: true,
        paranoid: true
    });

    return Payment;
};
