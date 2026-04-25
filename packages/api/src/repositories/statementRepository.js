async function createEntry(connection, entry) {
  await connection.query(
    `INSERT INTO lancamentos
      (conta_id, direcao, tipo_lancamento, valor, descricao, conta_relacionada, nome_favorecido)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.accountId,
      entry.direction,
      entry.entryType,
      entry.amount,
      entry.description || null,
      entry.relatedAccount || null,
      entry.favoredName || null
    ]
  );
}

async function findByAccountId(connection, accountId, limit, offset, periodDays) {
  const params = [accountId];
  let dateClause = '';

  if (periodDays) {
    dateClause = 'AND criado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    params.push(periodDays);
  }

  params.push(limit, offset);

  const [rows] = await connection.query(
    `SELECT id, direcao, tipo_lancamento, valor, descricao, conta_relacionada, nome_favorecido, criado_em
     FROM lancamentos
     WHERE conta_id = ?
     ${dateClause}
     ORDER BY criado_em DESC, id DESC
     LIMIT ? OFFSET ?`,
    params
  );

  return rows;
}

async function countByAccountId(connection, accountId, periodDays) {
  const params = [accountId];
  let dateClause = '';

  if (periodDays) {
    dateClause = 'AND criado_em >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    params.push(periodDays);
  }

  const [[row]] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM lancamentos
     WHERE conta_id = ?
     ${dateClause}`,
    params
  );

  return row.total;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM lancamentos');
}

module.exports = {
  createEntry,
  findByAccountId,
  countByAccountId,
  clearAll
};
