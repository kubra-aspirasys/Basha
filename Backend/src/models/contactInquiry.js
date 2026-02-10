'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ContactInquiry extends Model {
        static associate(models) {
            // No specific associations needed for now
        }
    }
    ContactInquiry.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        guest_count: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Disapproved'),
            defaultValue: 'Pending'
        },
        internal_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'ContactInquiry',
        tableName: 'contact_inquiries',
        underscored: true,
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    return ContactInquiry;
};
