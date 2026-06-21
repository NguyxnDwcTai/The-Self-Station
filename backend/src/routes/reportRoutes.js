const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/kpis', reportController.getKPIs);
router.get('/top-items', reportController.getTopItems);
router.get('/revenue-chart', reportController.getRevenueChart);
router.get('/category-share', reportController.getCategoryShare);

module.exports = router;
