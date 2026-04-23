const paymentService = require('../services/paymentService');

async function simulatePix(req, res, next) {
  try {
    const result = await paymentService.simulatePixPayment(req.user.sub, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  simulatePix
};
