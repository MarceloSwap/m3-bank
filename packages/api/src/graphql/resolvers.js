const authService = require('../services/authService');
const accountService = require('../services/accountService');
const transferService = require('../services/transferService');
const paymentService = require('../services/paymentService');
const AppError = require('../utils/AppError');

function ensureUser(context) {
  if (!context.user) {
    throw new AppError('Token inválido ou expirado', 401);
  }

  return context.user;
}

module.exports = {
  Query: {
    me: async (_, __, context) => {
      const user = ensureUser(context);
      return accountService.getAuthenticatedAccount(user.sub);
    },
    statement: async (_, args, context) => {
      const user = ensureUser(context);
      return accountService.getStatement(user.sub, args.page, args.limit, args.periodDays);
    }
  },
  Mutation: {
    login: async (_, { input }) => authService.login(input),
    register: async (_, { input }) => authService.register(input),
    transfer: async (_, { input }, context) => {
      const user = ensureUser(context);
      return transferService.createTransfer(user.sub, input);
    },
    simulatePix: async (_, { input }, context) => {
      const user = ensureUser(context);
      return paymentService.simulatePixPayment(user.sub, input);
    }
  }
};
