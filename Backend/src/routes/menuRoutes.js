const express = require('express');
const router = express.Router();
const {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleFeatured,
    getCategories,
    createCategory
} = require('../controllers/menuController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/items')
    .get(getMenuItems)
    .post(protect, admin, createMenuItem);

router.route('/items/:id')
    .put(protect, admin, updateMenuItem)
    .delete(protect, admin, deleteMenuItem);

router.route('/items/:id/featured')
    .patch(protect, admin, toggleFeatured);

router.route('/categories')
    .get(getCategories)
    .post(protect, admin, createCategory);

module.exports = router;
