const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if user is admin
            let user = await User.findByPk(decoded.id, { attributes: { exclude: ['password_hash'] } });

            // If not admin, check if customer
            if (!user) {
                user = await Customer.findByPk(decoded.id, { attributes: { exclude: ['password_hash'] } });
            }

            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            const message = error.message === 'jwt expired' ? 'Not authorized, token failed' : 'Not authorized, no token';
            next(new Error(message));
        }
    } else {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        next(new Error('Not authorized as an admin'));
    }
};

module.exports = { protect, admin };
