const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    bulkDeleteOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createOrderValidator, updateStatusValidator, mongoIdValidator } = require('../validators/orderValidator');

// All routes are protected and require admin or staff role
router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/', getAllOrders);
router.post('/', createOrderValidator, createOrder);
router.delete('/bulk', authorize('admin'), bulkDeleteOrders);
router.get('/:id', mongoIdValidator, getOrderDetails);
router.put('/:id/status', updateStatusValidator, updateOrderStatus);
router.put('/:id', mongoIdValidator, updateOrder);
router.delete('/:id', authorize('admin'), mongoIdValidator, deleteOrder);

module.exports = router;


