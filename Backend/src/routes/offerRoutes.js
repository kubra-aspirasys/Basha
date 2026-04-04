const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getAllOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    validateOffer,
    getPublicOffers,
    bulkDeleteOffers,
    markOfferAsUsed
} = require('../controllers/offerController');

const {
    validateCreateOffer,
    validateUpdateOffer
} = require('../validators/offerValidator');

// Public route for validation and listing available
router.post('/validate', validateOffer);
router.get('/available', getPublicOffers);

router.use(protect);
router.use(adminOnly);

router.get('/', getAllOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);
router.post('/bulk-delete', bulkDeleteOffers);
router.post('/:id/mark-used', markOfferAsUsed);

module.exports = router;
