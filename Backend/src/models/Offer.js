'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Offer extends Model {
        static associate(models) {
            // define associations here
        }
    }
    Offer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: false,
            defaultValue: 'percentage'
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        max_discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        valid_from: {
            type: DataTypes.DATE,
            allowNull: false
        },
        valid_to: {
            type: DataTypes.DATE,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        applicable_to: {
            type: DataTypes.ENUM('all', 'specific'),
            allowNull: false,
            defaultValue: 'all'
        },
        specific_users: {
            type: DataTypes.JSON,
            allowNull: true
        },
        item_applicability: {
            type: DataTypes.ENUM('all', 'specific'),
            allowNull: false,
            defaultValue: 'all'
        },
        specific_items: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Offer',
        tableName: 'offers',
        underscored: true,
        paranoid: false
    });
    return Offer;
};
