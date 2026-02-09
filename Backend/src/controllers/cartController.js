const { Cart, CartItem, MenuItem } = require('../models');

// Get current active cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        let cart = await Cart.findOne({
            where: {
                customer_id: userId,
                status: 'active'
            },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: MenuItem,
                            as: 'menu_item',
                            attributes: ['id', 'name', 'price', 'image_url', 'unit_type', 'is_available']
                        }
                    ]
                }
            ],
            order: [[{ model: CartItem, as: 'items' }, 'created_at', 'ASC']]
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [] }
            });
        }

        // Format response to match frontend expectation roughly, or just return structured data
        // The frontend expects items with menu info embedded mostly.
        const formattedItems = cart.items.map(item => ({
            id: item.menu_item.id, // Frontend uses menu item id as the main identifier often, but let's see. 
            // Actually frontend store uses 'id' as the item id. 
            // But if we want to support editing quantity, we might need the cart_item_id too or just look up by product id.
            // Let's pass both useful IDs.
            cart_item_id: item.id,
            menu_item_id: item.menu_item.id,
            name: item.menu_item.name,
            price: parseFloat(item.menu_item.price),
            quantity: item.quantity,
            image_url: item.menu_item.image_url,
            unit_type: item.menu_item.unit_type
        }));

        res.status(200).json({
            success: true,
            data: {
                id: cart.id,
                items: formattedItems
            }
        });

    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { menu_item_id, quantity } = req.body;

        if (!menu_item_id || !quantity) {
            return res.status(400).json({ success: false, message: 'Menu item ID and quantity required' });
        }

        // Check if item exists and is available
        const menuItem = await MenuItem.findByPk(menu_item_id);
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }
        if (!menuItem.is_available) {
            return res.status(400).json({ success: false, message: 'Item is not available' });
        }

        // Find or create active cart
        let [cart, created] = await Cart.findOrCreate({
            where: {
                customer_id: userId,
                status: 'active'
            },
            defaults: {
                customer_id: userId,
                status: 'active'
            }
        });

        // Check for existing items (handling potential duplicates)
        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart.id,
                menu_item_id: menu_item_id
            }
        });

        let cartItem;

        if (cartItems.length > 0) {
            // Duplicate handling: merge all into the first one
            const firstItem = cartItems[0];

            // Calculate total existing quantity from all duplicates
            const currentTotalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

            // Update the first item with new total
            firstItem.quantity = currentTotalQty + quantity;
            await firstItem.save();

            // Delete duplicates if any
            if (cartItems.length > 1) {
                const idsToDelete = cartItems.slice(1).map(i => i.id);
                await CartItem.destroy({
                    where: {
                        id: idsToDelete
                    }
                });
            }

            cartItem = firstItem;
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                cart_id: cart.id,
                menu_item_id: menu_item_id,
                quantity: quantity
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: cartItem
        });

    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { menu_item_id } = req.params;
        const { quantity } = req.body;

        // Find active cart
        const cart = await Cart.findOne({
            where: { customer_id: userId, status: 'active' }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'No active cart found' });
        }

        // Find all items matching this product (to handle duplicates)
        const cartItems = await CartItem.findAll({
            where: {
                cart_id: cart.id,
                menu_item_id: menu_item_id
            }
        });

        if (cartItems.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            // Remove all instances of this item
            await CartItem.destroy({
                where: {
                    cart_id: cart.id,
                    menu_item_id: menu_item_id
                }
            });
            return res.status(200).json({ success: true, message: 'Item removed from cart' });
        }

        // Update logic: Consolidate to first item
        const firstItem = cartItems[0];

        // Update first item to exact new quantity
        firstItem.quantity = quantity;
        await firstItem.save();

        // Delete duplicates if any
        if (cartItems.length > 1) {
            const idsToDelete = cartItems.slice(1).map(i => i.id);
            await CartItem.destroy({
                where: {
                    id: idsToDelete
                }
            });
        }

        res.status(200).json({ success: true, message: 'Cart updated' });

    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { menu_item_id } = req.params;

        const cart = await Cart.findOne({
            where: { customer_id: userId, status: 'active' }
        });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'No active cart found' });
        }

        await CartItem.destroy({
            where: {
                cart_id: cart.id,
                menu_item_id: menu_item_id
            }
        });

        res.status(200).json({ success: true, message: 'Item removed' });

    } catch (error) {
        console.error('Remove Cart Item Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({
            where: { customer_id: userId, status: 'active' }
        });

        if (cart) {
            await CartItem.destroy({
                where: { cart_id: cart.id }
            });
            // Optional: delete the cart itself or keep it empty
        }

        res.status(200).json({ success: true, message: 'Cart cleared' });

    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
