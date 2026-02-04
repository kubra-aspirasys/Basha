const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cartController');

router.use(protect); // All cart routes require authentication

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/:menu_item_id', updateCartItem);
router.delete('/:menu_item_id', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
