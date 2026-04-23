const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const accountRepository = require('../repositories/accountRepository');
const statementRepository = require('../repositories/statementRepository');

function formatStatementRow(row) {
  return {
    id: row.id,
    date: row.created_at,
    type: row.entry_type,
    description: row.description || '-',
    amount: row.amount,
    direction: row.direction,
    relatedAccount: row.related_account || null
  };
}

async function getAuthenticatedAccount(userId) {
  const connection = await pool.getConnection();

  try {
    const account = await accountRepository.findByUserId(connection, userId);

    if (!account) {
      throw new AppError('Conta não encontrada', 404);
    }

    return {
      id: account.id,
      number: account.account_number,
      digit: account.account_digit,
      balance: account.balance,
      active: Boolean(account.active),
      owner: {
        name: account.name,
        email: account.email,
        cpf: account.cpf,
        address: {
          street: account.street,
          neighborhood: account.neighborhood,
          city: account.city,
          state: account.state,
          zipCode: account.zip_code
        }
      }
    };
  } finally {
    connection.release();
  }
}

async function listAccounts() {
  const connection = await pool.getConnection();

  try {
    const accounts = await accountRepository.findAllActive(connection);
    return accounts.map((account) => ({
      id: account.id,
      number: account.account_number,
      digit: account.account_digit,
      balance: account.balance,
      active: Boolean(account.active),
      ownerName: account.name,
      ownerEmail: account.email
    }));
  } finally {
    connection.release();
  }
}

async function getStatement(userId, page = 1, limit = 10, periodDays = 30) {
  const connection = await pool.getConnection();

  try {
    const account = await accountRepository.findByUserId(connection, userId);

    if (!account) {
      throw new AppError('Conta não encontrada', 404);
    }

    const parsedPage = Number(page) > 0 ? Number(page) : 1;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;
    const parsedDays = [7, 15, 30].includes(Number(periodDays)) ? Number(periodDays) : 30;
    const offset = (parsedPage - 1) * parsedLimit;

    const [entries, total] = await Promise.all([
      statementRepository.findByAccountId(connection, account.id, parsedLimit, offset, parsedDays),
      statementRepository.countByAccountId(connection, account.id, parsedDays)
    ]);

    return {
      page: parsedPage,
      limit: parsedLimit,
      total,
      periodDays: parsedDays,
      balance: account.balance,
      entries: entries.map(formatStatementRow)
    };
  } finally {
    connection.release();
  }
}

module.exports = {
  getAuthenticatedAccount,
  listAccounts,
  getStatement
};
