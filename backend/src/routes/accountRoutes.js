const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/me', accountController.getMe);
router.get('/', accountController.getAllAccounts);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.put('/:id/role', accountController.updateRole);
router.put('/:id/lock', accountController.toggleLock);

module.exports = router;
