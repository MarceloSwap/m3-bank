const express = require('express');
const transferController = require('../controllers/transferController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, transferController.create);

module.exports = router;
