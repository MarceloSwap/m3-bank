const express = require('express');
const depositController = require('../controllers/depositController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, depositController.create);

module.exports = router;