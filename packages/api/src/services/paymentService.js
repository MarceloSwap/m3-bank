const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const { parseMoney } = require('../utils/validators');
const accountRepository = require('../repositories/accountRepository');
const statementRepository = require('../repositories/statementRepository');
const pixRepository = require('../repositories/pixRepository');

function normalizeAccountRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    balance: Number(row.saldo)
  };
}

async function simulatePixPayment(userId, payload) {
  const { amount, description } = payload;
  const parsedAmount = parseMoney(amount);

  if (!parsedAmount || parsedAmount <= 0) {
    throw new AppError('Informe um valor válido para o pagamento', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const account = normalizeAccountRow(
      await accountRepository.findByUserId(connection, userId)
    );

    if (!account) {
      throw new AppError('Conta não encontrada', 404);
    }

    if (account.balance < parsedAmount) {
      throw new AppError('Saldo insuficiente para realizar o pagamento', 400);
    }

    const newBalance = Number((account.balance - parsedAmount).toFixed(2));

    await accountRepository.updateBalance(connection, account.id, newBalance);

    await pixRepository.create(connection, {
      accountId: account.id,
      amount: parsedAmount,
      description: description || 'Pagamento Pix simulado',
      qrCodeReference: 'M3BANK-STATIC-QR'
    });

    await statementRepository.createEntry(connection, {
      accountId: account.id,
      direction: 'debit',
      entryType: 'Pagamento Pix',
      amount: parsedAmount,
      description: description || 'Pagamento Pix simulado',
      relatedAccount: 'QR ESTATICO',
      favoredName: null // Pix simulado, sem favorecido específico
    });

    await connection.commit();

    return {
      message: 'Pagamento Pix simulado realizado com sucesso',
      balance: newBalance
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  simulatePixPayment
};
