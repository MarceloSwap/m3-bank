const depositService = require('../services/depositService');

async function create(req, res, next) {
  try {
    const result = await depositService.createDeposit(req.user.sub, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create
};