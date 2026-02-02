'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuType extends Model {
        static associate(models) {
            MenuType.hasMany(models.MenuItem, { foreignKey: 'type_id', as: 'items' });
        }
    }
    MenuType.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
        color: DataTypes.STRING,
        icon: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'MenuType',
        tableName: 'menu_types',
        underscored: true,
        paranoid: true
    });
    return MenuType;
};
