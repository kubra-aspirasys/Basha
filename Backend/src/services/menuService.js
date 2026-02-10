const { MenuItem, MenuCategory, MenuItemImage, Sequelize } = require('../models');
const { Op } = Sequelize;

const listMenuItems = async ({ page = 1, limit = 10, search, category, type, available, sortBy = 'created_at', sortOrder = 'DESC' }) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        const lowerSearch = search.toLowerCase();
        where[Op.or] = [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('MenuItem.name')), 'LIKE', `%${lowerSearch}%`),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('MenuItem.description')), 'LIKE', `%${lowerSearch}%`)
        ];
    }

    if (category) {
        where.category_id = category;
    }

    if (available !== undefined) {
        where.is_available = available === 'true' || available === true;
    }

    // "type" filter: Veg/Non-Veg
    if (type) {
        if (type.toLowerCase() === 'veg') {
            where.is_vegetarian = true;
        } else if (type.toLowerCase() === 'non-veg') {
            where.is_vegetarian = false;
        }
        // If 'egg', it might need specific handling if schema supports it, but strictly is_vegetarian is boolean.
        // Assuming 'egg' falls under non-veg or handled differently. For now, boolean map.
    }

    const { count, rows } = await MenuItem.findAndCountAll({
        where,
        include: [
            {
                model: MenuCategory,
                as: 'category',
                attributes: ['id', 'name']
            },
            {
                model: MenuItemImage,
                as: 'images',
                attributes: ['id', 'image_url']
            }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        distinct: true // distinct id to handle 1:N includes
    });

    return {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        items: rows
    };
};

const getMenuItemCount = async () => {
    const total = await MenuItem.count();
    const available = await MenuItem.count({ where: { is_available: true } });
    return { total, available };
};

const createMenuItem = async (data, imageFile) => {
    let transaction;
    try {
        transaction = await MenuItem.sequelize.transaction();

        // Handle image URL
        let mainImageUrl = null;
        if (imageFile) {
            // Assuming "uploads/" is served as static
            mainImageUrl = `/uploads/${imageFile.filename}`;
        } else if (data.image_url) {
            mainImageUrl = data.image_url;
        }

        const menuItem = await MenuItem.create({
            ...data,
            image_url: mainImageUrl // Legacy support or main image
        }, { transaction });

        if (mainImageUrl) {
            await MenuItemImage.create({
                menu_item_id: menuItem.id,
                image_url: mainImageUrl,
                display_order: 0
            }, { transaction });
        }

        await transaction.commit();
        return menuItem;
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

const updateMenuItem = async (id, data, imageFile) => {
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
        throw new Error('Menu item not found');
    }

    let transaction;
    try {
        transaction = await MenuItem.sequelize.transaction();

        const updates = { ...data };

        if (imageFile) {
            updates.image_url = `/uploads/${imageFile.filename}`;
            // Add to images table too
            await MenuItemImage.create({
                menu_item_id: id,
                image_url: updates.image_url,
                display_order: 0 // Logic to put at end? Or replace? 
            }, { transaction });
        } else if (data.image_url) {
            updates.image_url = data.image_url;
            // Might want to add to images table if it's new, but simple update is fine for MVP
        }

        await menuItem.update(updates, { transaction });
        await transaction.commit();
        return menuItem.reload();
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

const toggleAvailability = async (id) => {
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
        throw new Error('Menu item not found');
    }
    const newStatus = !menuItem.is_available;
    await menuItem.update({ is_available: newStatus });
    return { id, is_available: newStatus };
};

const toggleFeatured = async (id) => {
    // Check limit? "Enforce max featured limit (configurable)"
    // Allow e.g. 10.
    const MAX_FEATURED = 10;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
        throw new Error('Menu item not found');
    }

    if (!menuItem.is_featured) {
        // We are enabling it, check count
        const count = await MenuItem.count({ where: { is_featured: true } });
        if (count >= MAX_FEATURED) {
            throw new Error(`Cannot feature more than ${MAX_FEATURED} items`);
        }
    }

    const newStatus = !menuItem.is_featured;
    await menuItem.update({ is_featured: newStatus });
    return { id, is_featured: newStatus };
};

const deleteMenuItem = async (id) => {
    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
        throw new Error('Menu item not found');
    }
    await menuItem.destroy(); // Soft delete due to paranoid: true in model
    return { id, message: 'Menu item deleted successfully' };
};

const getAllCategories = async () => {
    return await MenuCategory.findAll({
        order: [['display_order', 'ASC']],
        where: { is_active: true }
    });
};

const getAllTypes = async () => {
    // Check if MenuType exists, otherwise return hardcoded or empty
    const { MenuType, ProductType } = require('../models');
    const Model = MenuType || ProductType;
    if (Model) {
        return await Model.findAll();
    }
    return [];
};

const createCategory = async (data) => {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return await MenuCategory.create({
        ...data,
        slug
    });
};

const createType = async (data) => {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    // Check if MenuType exists
    const { MenuType } = require('../models');
    if (MenuType) {
        return await MenuType.create({
            ...data,
            slug,
            color: data.color || '#6B7280' // Default grey if no color
        });
    }
    throw new Error('MenuType model not found');
};

const getAllMenuItems = async () => {
    const items = await MenuItem.findAll({
        where: { is_available: true },
        include: [
            {
                model: MenuCategory,
                as: 'category',
                attributes: ['id', 'name', 'display_order']
            },
            {
                model: MenuItemImage,
                as: 'images',
                attributes: ['id', 'image_url']
            }
        ],
        order: [
            [{ model: MenuCategory, as: 'category' }, 'display_order', 'ASC'],
            ['name', 'ASC']
        ]
    });
    return items;
};

module.exports = {
    listMenuItems,
    getAllMenuItems,
    getMenuItemCount,
    createMenuItem,
    updateMenuItem,
    toggleAvailability,
    toggleFeatured,
    deleteMenuItem,
    getAllCategories,
    getAllTypes,
    createCategory,
    createType
};
