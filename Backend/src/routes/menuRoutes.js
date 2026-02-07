const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(protect);

// GET /menu-items - List items (Admin/Staff)
router.get('/', authorize('admin', 'staff'), menuController.listMenuItems);

// GET /menu-items/categories - List categories (Admin/Staff)
router.get('/categories', authorize('admin', 'staff'), menuController.listCategories);

// GET /menu-items/types - List types (Admin/Staff)
router.get('/types', authorize('admin', 'staff'), menuController.listTypes);

// POST /menu-items/categories - Create category (Admin only)
router.post('/categories', authorize('admin'), menuController.createCategory);

// POST /menu-items/types - Create type (Admin only)
router.post('/types', authorize('admin'), menuController.createType);

// GET /menu-items/count - Get counts (Admin/Staff)
router.get('/count', authorize('admin', 'staff'), menuController.getMenuItemCount);

// POST /menu-items - Add item (Admin only)
router.post('/', authorize('admin'), upload.single('image'), menuController.createMenuItem);

// PATCH /menu-items/:id - Update item (Admin/Staff)
router.patch('/:id', authorize('admin', 'staff'), upload.single('image'), menuController.updateMenuItem);

// PATCH /menu-items/:id/availability - Toggle availability (Admin/Staff)
router.patch('/:id/availability', authorize('admin', 'staff'), menuController.toggleAvailability);

// PATCH /menu-items/:id/featured - Toggle featured (Admin/Staff)
router.patch('/:id/featured', authorize('admin', 'staff'), menuController.toggleFeatured);

// DELETE /menu-items/:id - Delete item (Admin only)
router.delete('/:id', authorize('admin'), menuController.deleteMenuItem);

module.exports = router;
