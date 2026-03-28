'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CustomerAddress extends Model {
        static associate(models) {
            CustomerAddress.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
        }
    }
    CustomerAddress.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        label: {
            type: DataTypes.STRING,
            defaultValue: 'Home', // Home, Work, Other
        },
        house_address: DataTypes.TEXT,
        street: DataTypes.STRING,
        locality: DataTypes.STRING,
        city: {
            type: DataTypes.STRING,
            defaultValue: 'Ambur'
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'CustomerAddress',
        tableName: 'customer_addresses',
        underscored: true,
        paranoid: true
    });
    return CustomerAddress;
};
