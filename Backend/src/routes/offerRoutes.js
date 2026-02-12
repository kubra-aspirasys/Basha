const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllOffers,
    createOffer,
    updateOffer,
    deleteOffer
} = require('../controllers/offerController');

router.use(protect);
router.use(admin);

router.get('/', getAllOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
