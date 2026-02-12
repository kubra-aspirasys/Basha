'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UsedCoupon extends Model {
        static associate(models) {
            // define associations here
        }
    }
    UsedCoupon.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        offer_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'UsedCoupon',
        tableName: 'used_coupons',
        underscored: true,
        updatedAt: false
    });
    return UsedCoupon;
};
