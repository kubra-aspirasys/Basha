'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Quote extends Model {
        static associate(models) {
            // Quote belongs to Inquiry
            Quote.belongsTo(models.Inquiry, {
                foreignKey: 'inquiry_id',
                as: 'inquiry'
            });
            // Associations for items/products could be added here later if needed
        }
    }
    Quote.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        inquiry_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        details: {
            type: DataTypes.TEXT, // Using TEXT for simple details, or JSON if structured data is needed later
            allowNull: true
        },
        valid_until: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired'),
            defaultValue: 'draft'
        }
    }, {
        sequelize,
        modelName: 'Quote',
        tableName: 'quotes',
        underscored: true,
        paranoid: true // Soft delete support
    });
    return Quote;
};
