const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.put('/:orderId/details/:detailId/status', orderController.updateOrderItemStatus);

module.exports = router;
