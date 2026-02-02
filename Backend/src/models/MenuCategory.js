'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MenuCategory extends Model {
        static associate(models) {
            MenuCategory.hasMany(models.MenuItem, { foreignKey: 'category_id', as: 'items' });
        }
    }
    MenuCategory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
        description: DataTypes.TEXT,
        image_url: DataTypes.STRING,
        display_order: DataTypes.INTEGER,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'MenuCategory',
        tableName: 'menu_categories',
        underscored: true,
        paranoid: true
    });
    return MenuCategory;
};
