'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Banner extends Model {
        static associate(models) {
            // define associations here
        }
    }
    Banner.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: DataTypes.STRING,
        subtitle: DataTypes.STRING,
        image_url: DataTypes.STRING,
        link_url: DataTypes.STRING,
        link_type: DataTypes.ENUM('none', 'internal', 'external'),
        is_active: DataTypes.BOOLEAN,
        display_order: DataTypes.INTEGER,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Banner',
        tableName: 'banners',
        underscored: true,
        timestamps: true
    });
    return Banner;
};
