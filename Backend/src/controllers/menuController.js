const menuService = require('../services/menuService');
const { createMenuItemSchema, updateMenuItemSchema, listMenuItemsSchema } = require('../validators/menuValidator');

const listMenuItems = async (req, res, next) => {
    try {
        const { error, value } = listMenuItemsSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const result = await menuService.listMenuItems(value);
        res.json({
            success: true,
            message: 'Menu items retrieved successfully',
            data: result.items, // Ensure it matches Frontend expectation if they expect array directly or {items: [], total: X}
            pagination: { // Adding pagination metadata structure if required, or keep user response
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getMenuItemCount = async (req, res, next) => {
    try {
        const result = await menuService.getMenuItemCount();
        res.json({
            success: true,
            message: 'Menu item counts retrieved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createMenuItem = async (req, res, next) => {
    try {
        const { error, value } = createMenuItemSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const newItem = await menuService.createMenuItem(value, req.file);
        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: newItem
        });
    } catch (error) {
        next(error);
    }
};

const updateMenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = updateMenuItemSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const updatedItem = await menuService.updateMenuItem(id, value, req.file);
        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        next(error);
    }
};

const toggleAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await menuService.toggleAvailability(id);
        res.json({
            success: true,
            message: 'Menu item availability toggled successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const toggleFeatured = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await menuService.toggleFeatured(id);
        res.json({
            success: true,
            message: 'Menu item featured status toggled successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteMenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await menuService.deleteMenuItem(id);
        res.json({
            success: true,
            message: 'Menu item deleted successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const listCategories = async (req, res, next) => {
    try {
        const categories = await menuService.getAllCategories();
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

const listTypes = async (req, res, next) => {
    try {
        const types = await menuService.getAllTypes();
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await menuService.createCategory(req.body);
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

const createType = async (req, res, next) => {
    try {
        const type = await menuService.createType(req.body);
        res.status(201).json({
            success: true,
            data: type
        });
    } catch (error) {
        next(error);
    }
};

const getAllMenuItems = async (req, res, next) => {
    try {
        const items = await menuService.getAllMenuItems();
        res.json({
            success: true,
            message: 'All menu items retrieved successfully',
            data: items
        });
    } catch (error) {
        next(error);
    }
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
    listCategories,
    listTypes,
    createCategory,
    createType
};
