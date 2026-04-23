const express = require('express');
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, accountController.me);
router.get('/', authMiddleware, accountController.list);
router.get('/statement', authMiddleware, accountController.statement);

module.exports = router;
