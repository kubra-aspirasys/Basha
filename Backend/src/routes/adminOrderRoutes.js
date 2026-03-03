const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createOrderValidator, updateStatusValidator, mongoIdValidator } = require('../validators/orderValidator');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllOrders);
router.post('/', createOrderValidator, createOrder);
router.get('/:id', mongoIdValidator, getOrderDetails);
router.put('/:id/status', updateStatusValidator, updateOrderStatus);
router.delete('/:id', mongoIdValidator, deleteOrder);

module.exports = router;

