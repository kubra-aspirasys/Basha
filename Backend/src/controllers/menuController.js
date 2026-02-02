const { MenuItem, MenuCategory, MenuType } = require('../models');

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Public
const getMenuItems = async (req, res, next) => {
    try {
        const items = await MenuItem.findAll({
            include: [
                { model: MenuCategory, as: 'category' },
                { model: MenuType, as: 'type' }
            ],
            order: [
                ['is_featured', 'DESC'],
                ['featured_priority', 'ASC'],
                ['created_at', 'DESC']
            ]
        });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a menu item
// @route   POST /api/menu/items
// @access  Private/Admin
const createMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.create(req.body);
        const fullItem = await MenuItem.findByPk(item.id, {
            include: ['category', 'type']
        });
        res.status(201).json(fullItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/items/:id
// @access  Private/Admin
const updateMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (item) {
            await item.update(req.body);
            const fullItem = await MenuItem.findByPk(item.id, {
                include: ['category', 'type']
            });
            res.json(fullItem);
        } else {
            res.status(404);
            throw new Error('Menu item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (item) {
            await item.destroy();
            res.json({ message: 'Menu item removed' });
        } else {
            res.status(404);
            throw new Error('Menu item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle featured status
// @route   PATCH /api/menu/items/:id/featured
// @access  Private/Admin
const toggleFeatured = async (req, res, next) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (item) {
            item.is_featured = !item.is_featured;
            if (item.is_featured && !item.featured_priority) {
                // Simple logic to put at end of featured list
                const count = await MenuItem.count({ where: { is_featured: true } });
                item.featured_priority = count + 1;
            }
            await item.save();
            const fullItem = await MenuItem.findByPk(item.id, {
                include: ['category', 'type']
            });
            res.json(fullItem);
        } else {
            res.status(404);
            throw new Error('Menu item not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const categories = await MenuCategory.findAll({
            order: [['display_order', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
    try {
        const category = await MenuCategory.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleFeatured,
    getCategories,
    createCategory
};
