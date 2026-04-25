const pool = require('../db/pool');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { isNumeric, parseMoney } = require('../utils/validators');
const { getTransferLimitByTime } = require('../utils/time');
const accountRepository = require('../repositories/accountRepository');
const statementRepository = require('../repositories/statementRepository');
const transferRepository = require('../repositories/transferRepository');

function normalizeAccountRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    active: Boolean(row.ativa),
    balance: Number(row.saldo)
  };
}

async function createTransfer(userId, payload) {
  const {
    accountNumber,
    accountDigit,
    amount,
    description,
    authorizationToken
  } = payload;

  if (!accountNumber || !accountDigit || !isNumeric(accountNumber) || !isNumeric(accountDigit)) {
    throw new AppError('Conta inválida ou inexistente', 400);
  }

  if (!description) {
    throw new AppError('Descrição é obrigatória', 400);
  }

  const parsedAmount = parseMoney(amount);
  if (!parsedAmount || parsedAmount < 10) {
    throw new AppError('Valor mínimo para transferência é de R$ 10,00', 400);
  }

  const dynamicLimit = getTransferLimitByTime(env.timezone);
  if (parsedAmount > dynamicLimit.limit) {
    const message =
      dynamicLimit.period === 'night'
        ? 'Valor excede o limite noturno permitido'
        : 'Valor excede o limite máximo permitido para transferência';
    throw new AppError(message, 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const sourceAccount = normalizeAccountRow(
      await accountRepository.findByUserId(connection, userId)
    );
    const destinationAccount = normalizeAccountRow(
      await accountRepository.findByNumberAndDigit(
        connection,
        accountNumber,
        accountDigit
      )
    );

    if (!sourceAccount || !destinationAccount || !destinationAccount.active) {
      throw new AppError('Conta inválida ou inexistente', 404);
    }

    if (sourceAccount.id === destinationAccount.id) {
      throw new AppError('Não é possível transferir para a própria conta', 400);
    }

    if (sourceAccount.balance < parsedAmount) {
      throw new AppError('Saldo insuficiente para realizar a transferência', 400);
    }

    const needsExtraToken = parsedAmount > 5000;
    if (needsExtraToken && authorizationToken !== '123456') {
      throw new AppError('Token de autorização inválido', 401);
    }

    const sourceNewBalance = Number((sourceAccount.balance - parsedAmount).toFixed(2));
    const destinationNewBalance = Number((destinationAccount.balance + parsedAmount).toFixed(2));

    await accountRepository.updateBalance(connection, sourceAccount.id, sourceNewBalance);
    await accountRepository.updateBalance(connection, destinationAccount.id, destinationNewBalance);

    await transferRepository.create(connection, {
      sourceAccountId: sourceAccount.id,
      destinationAccountId: destinationAccount.id,
      amount: parsedAmount,
      description,
      authorizationTokenUsed: needsExtraToken
    });

    await statementRepository.createEntry(connection, {
      accountId: sourceAccount.id,
      direction: 'debit',
      entryType: 'Transferência enviada',
      amount: parsedAmount,
      description,
      relatedAccount: `${destinationAccount.numero_conta}-${destinationAccount.digito_conta}`,
      favoredName: destinationAccount.nome
    });

    await statementRepository.createEntry(connection, {
      accountId: destinationAccount.id,
      direction: 'credit',
      entryType: 'Transferência recebida',
      amount: parsedAmount,
      description,
      relatedAccount: `${sourceAccount.numero_conta}-${sourceAccount.digito_conta}`,
      favoredName: sourceAccount.nome
    });

    await connection.commit();

    return {
      message: 'Transferência realizada com sucesso',
      balance: sourceNewBalance
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createTransfer
};
