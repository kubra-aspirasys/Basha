'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SiteSetting extends Model {
        static associate(models) {
            // define associations here
        }
    }
    SiteSetting.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('text', 'json', 'number', 'boolean'),
            defaultValue: 'text'
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: 'general'
        },
        description: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'SiteSetting',
        tableName: 'site_settings',
        underscored: true,
        timestamps: true
    });
    return SiteSetting;
};
