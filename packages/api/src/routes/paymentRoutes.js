const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/pix/simulate', authMiddleware, paymentController.simulatePix);

module.exports = router;
