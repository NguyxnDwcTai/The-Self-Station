const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

router.get('/', promotionController.getAllPromotions);
router.post('/', promotionController.createPromotion);

router.get('/vouchers', promotionController.getAllVouchers);
router.post('/vouchers', promotionController.createVoucher);

router.put('/vouchers/:id/status', promotionController.toggleVoucherStatus);

module.exports = router;
