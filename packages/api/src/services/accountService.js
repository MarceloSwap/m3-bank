const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const accountRepository = require('../repositories/accountRepository');
const statementRepository = require('../repositories/statementRepository');

function formatStatementRow(row, account) {
  let receiverName = null;
  let receiverAccount = null;

  if (row.tipo_lancamento === 'Abertura de conta') {
    receiverName = account.nome;
    receiverAccount = `${account.numero_conta}-${account.digito_conta}`;
  } else if (row.tipo_lancamento === 'Transferência enviada') {
    receiverName = row.nome_favorecido;
    receiverAccount = row.conta_relacionada;
  } else if (row.tipo_lancamento === 'Transferência recebida') {
    // Para recebida, o receiver é o remetente
    receiverName = row.nome_favorecido;
    receiverAccount = row.conta_relacionada;
  } else if (row.tipo_lancamento === 'Depósito') {
    receiverName = account.nome;
    receiverAccount = `${account.numero_conta}-${account.digito_conta}`;
  }

  const result = {
    id: row.id,
    date: row.criado_em.toISOString(),
    type: row.tipo_lancamento,
    description: row.descricao || '-',
    amount: row.valor,
    direction: row.direcao,
    relatedAccount: row.conta_relacionada || null,
    favoredName: row.nome_favorecido || null,
    receiverName,
    receiverAccount
  };

  return result;
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
      number: account.numero_conta,
      digit: account.digito_conta,
      balance: account.saldo,
      active: Boolean(account.ativa),
      owner: {
        name: account.nome,
        email: account.email,
        cpf: account.cpf
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
      number: account.numero_conta,
      digit: account.digito_conta,
      balance: account.saldo,
      active: Boolean(account.ativa),
      ownerName: account.nome,
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
      balance: account.saldo,
      entries: entries.map(row => formatStatementRow(row, account))
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
