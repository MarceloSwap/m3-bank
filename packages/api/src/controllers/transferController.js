const transferService = require('../services/transferService');

async function create(req, res, next) {
  try {
    const result = await transferService.createTransfer(req.user.sub, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create
};
