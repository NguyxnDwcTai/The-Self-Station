const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');

// Quét thẻ thưởng
router.post('/scan-card', kioskController.scanCard);

// Lấy menu đang phục vụ
router.get('/menu', kioskController.getMenu);

// Đặt hàng
router.post('/orders', kioskController.createOrder);

// Theo dõi đơn
router.get('/orders/:id', kioskController.getOrderTracking);

// Cập nhật số lượng item trong đơn (theo detailId)
router.put('/orders/:orderID/details/:detailId', kioskController.updateOrderDetail);

// Thêm món mới vào đơn
router.post('/orders/:orderID/items', kioskController.addNewItem);

module.exports = router;
