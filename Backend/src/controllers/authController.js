const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Customer } = require('../models');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
};

// @desc    Auth Admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth Customer & get token
// @route   POST /api/auth/customer/login
// @access  Public
const loginCustomer = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ where: { email } });

        if (customer && customer.is_blocked) {
            res.status(401);
            throw new Error('Your account has been blocked.');
        }

        if (customer && (await bcrypt.compare(password, customer.password_hash))) {
            // Update last activity
            await customer.update({ last_activity: new Date() });

            res.json({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                token: generateToken(customer.id, 'customer'),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new customer
// @route   POST /api/auth/customer/signup
// @access  Public
const registerCustomer = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const userExists = await Customer.findOne({ where: { email } });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const customer = await Customer.create({
            name,
            email,
            password_hash,
            phone,
            address,
            is_active: true
        });

        if (customer) {
            res.status(201).json({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                token: generateToken(customer.id, 'customer'),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginAdmin,
    loginCustomer,
    registerCustomer
};
