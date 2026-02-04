'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CartItem extends Model {
        static associate(models) {
            CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
            CartItem.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
        }
    }
    CartItem.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        cart_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        menu_item_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                min: 1
            }
        }
    }, {
        sequelize,
        modelName: 'CartItem',
        tableName: 'cart_items',
        underscored: true,
        paranoid: true
    });
    return CartItem;
};
