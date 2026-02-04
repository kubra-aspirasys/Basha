'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        static associate(models) {
            Cart.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
            Cart.hasMany(models.CartItem, { foreignKey: 'cart_id', as: 'items' });
        }
    }
    Cart.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'ordered', 'abandoned'),
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'Cart',
        tableName: 'carts',
        underscored: true,
        paranoid: true
    });
    return Cart;
};
