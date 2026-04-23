const accountService = require('../services/accountService');

async function me(req, res, next) {
  try {
    const result = await accountService.getAuthenticatedAccount(req.user.sub);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const result = await accountService.listAccounts();
    res.status(200).json({ accounts: result });
  } catch (error) {
    next(error);
  }
}

async function statement(req, res, next) {
  try {
    const result = await accountService.getStatement(
      req.user.sub,
      req.query.page,
      req.query.limit,
      req.query.periodDays
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  me,
  list,
  statement
};
