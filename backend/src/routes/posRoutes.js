const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');

// Module 1: Member & Reward
router.get('/customer', posController.findCustomer);
router.post('/customer/link-order', posController.linkCustomerToOrder);

// Module 2: Payment & Checkout
router.get('/bill', posController.getBill);
router.post('/voucher/validate', posController.validateVoucher);
router.post('/checkout', posController.processCheckout);

// Module 3: Reporting
router.get('/report/daily-summary', posController.getDailySummary);

module.exports = router;
