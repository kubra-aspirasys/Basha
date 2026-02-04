'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FAQ extends Model {
        static associate(models) {
            // define associations here
        }
    }
    FAQ.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: DataTypes.STRING,
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'FAQ',
        tableName: 'faqs',
        underscored: true,
        timestamps: true
    });
    return FAQ;
};
