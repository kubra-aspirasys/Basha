'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Customer extends Model {
        static associate(models) {
            Customer.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
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
        address: DataTypes.TEXT,
        is_blocked: DataTypes.BOOLEAN,
        is_active: DataTypes.BOOLEAN,
        last_activity: DataTypes.DATE,
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
