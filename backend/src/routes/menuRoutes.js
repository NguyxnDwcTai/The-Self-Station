const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/categories', menuController.getAllCategories);
router.post('/categories', menuController.createCategory);
router.get('/', menuController.getAllMenuItems);
router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
