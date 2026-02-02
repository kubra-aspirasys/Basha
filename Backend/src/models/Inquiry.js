'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Inquiry extends Model {
        static associate(models) {
            // define associations here if any (e.g. assigned_to -> User)
        }
    }
    Inquiry.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        full_name: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        event_date: DataTypes.DATEONLY,
        event_type: DataTypes.STRING,
        guest_count: DataTypes.INTEGER,
        additional_details: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('new', 'contacted', 'quoted', 'converted', 'closed'),
            defaultValue: 'new'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            defaultValue: 'medium'
        },
        assigned_to: DataTypes.STRING,
        notes: DataTypes.TEXT,
        quote_amount: DataTypes.DECIMAL(10, 2)
    }, {
        sequelize,
        modelName: 'Inquiry',
        tableName: 'inquiries',
        underscored: true,
        paranoid: true
    });
    return Inquiry;
};
