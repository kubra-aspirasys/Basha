const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    validateOffer,
    getPublicOffers
} = require('../controllers/offerController');

const {
    validateCreateOffer,
    validateUpdateOffer
} = require('../validators/offerValidator');

// Public route for validation and listing available
router.post('/validate', validateOffer);
router.get('/available', getPublicOffers);

router.use(protect);
router.use(admin);

router.get('/', getAllOffers);
router.post('/', validateCreateOffer, createOffer);
router.put('/:id', validateUpdateOffer, updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
