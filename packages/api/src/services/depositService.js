const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const { isNumeric, parseMoney } = require('../utils/validators');
const accountRepository = require('../repositories/accountRepository');
const statementRepository = require('../repositories/statementRepository');
const depositRepository = require('../repositories/depositRepository');

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

async function createDeposit(userId, payload) {
  const {
    accountNumber,
    accountDigit,
    amount,
    description
  } = payload;

  if (!accountNumber || !accountDigit || !isNumeric(accountNumber) || !isNumeric(accountDigit)) {
    throw new AppError('Conta inválida ou inexistente', 400);
  }

  if (!description) {
    throw new AppError('Descrição é obrigatória', 400);
  }

  const parsedAmount = parseMoney(amount);
  if (!parsedAmount || parsedAmount < 10) {
    throw new AppError('Valor mínimo para depósito é de R$ 10,00', 400);
  }

  if (parsedAmount > 10000) {
    throw new AppError('Valor máximo para depósito é de R$ 10.000,00', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const destinationAccount = normalizeAccountRow(
      await accountRepository.findByNumberAndDigit(
        connection,
        accountNumber,
        accountDigit
      )
    );

    if (!destinationAccount || !destinationAccount.active) {
      throw new AppError('Conta inválida ou inexistente', 404);
    }

    const newBalance = Number((destinationAccount.balance + parsedAmount).toFixed(2));

    await accountRepository.updateBalance(connection, destinationAccount.id, newBalance);

    await depositRepository.create(connection, {
      accountId: destinationAccount.id,
      amount: parsedAmount,
      description
    });

    await statementRepository.createEntry(connection, {
      accountId: destinationAccount.id,
      direction: 'credit',
      entryType: 'Depósito',
      amount: parsedAmount,
      description,
      favoredName: destinationAccount.nome
    });

    await connection.commit();

    return {
      message: `Depósito de ${parsedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} realizado com sucesso na conta ${accountNumber}-${accountDigit}`,
      newBalance
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createDeposit
};