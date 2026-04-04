'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Customer extends Model {
        static associate(models) {
            Customer.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
            Customer.hasMany(models.CustomerAddress, { foreignKey: 'customer_id', as: 'addresses' });
        }
    }
    Customer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password_hash: DataTypes.STRING,
        phone: DataTypes.STRING,
        house_address: DataTypes.TEXT,
        street: DataTypes.STRING,
        locality: DataTypes.STRING,
        city: DataTypes.STRING,
        address_type: DataTypes.STRING,
        is_blocked: DataTypes.BOOLEAN,
        is_active: DataTypes.BOOLEAN,
        last_activity: DataTypes.DATE,
        role: {
          type: DataTypes.STRING, // Use STRING since it's always 'customer' for this table
          defaultValue: 'customer'
        },
        avatar_url: DataTypes.TEXT('long'),
        reset_password_token: DataTypes.STRING,
        reset_password_expires: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Customer',
        tableName: 'customers',
        underscored: true,
        paranoid: true
    });
    return Customer;
};
