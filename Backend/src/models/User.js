'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // define associations here
        }
    }
    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password_hash: DataTypes.STRING,
        phone: DataTypes.STRING,
        avatar_url: DataTypes.TEXT('long'),
        role: {
            type: DataTypes.ENUM('admin'),
            defaultValue: 'admin'
        },
        reset_password_token: DataTypes.STRING,
        reset_password_expires: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        paranoid: true // soft delete
    });
    return User;
};
