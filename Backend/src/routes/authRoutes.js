const express = require('express');
const router = express.Router();
const { loginAdmin, loginCustomer, registerCustomer } = require('../controllers/authController');

router.post('/admin/login', loginAdmin);
router.post('/customer/login', loginCustomer);
router.post('/customer/signup', registerCustomer);

module.exports = router;
