const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderDetails,
    cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
// authorize('customer') is implicit if not admin, but we can enforce if needed. 
// authMiddleware ensures `req.user` is populated. 
const { createOrderValidator, mongoIdValidator } = require('../validators/orderValidator');

router.use(protect);
// Optional: router.use(authorize('customer')); 
// But since we want to allow technically any authenticated user who creates an order to be a "customer" of that order,
// and authMiddleware distinguishes via User vs Customer table search, we rely on protect.

router.post('/', createOrderValidator, createOrder);
router.get('/', getMyOrders);
router.get('/:id', mongoIdValidator, getOrderDetails);
router.put('/:id/cancel', mongoIdValidator, cancelOrder);

module.exports = router;
