async function createEntry(connection, entry) {
  await connection.query(
    `INSERT INTO ledger_entries
      (account_id, direction, entry_type, amount, description, related_account)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.accountId,
      entry.direction,
      entry.entryType,
      entry.amount,
      entry.description || null,
      entry.relatedAccount || null
    ]
  );
}

async function findByAccountId(connection, accountId, limit, offset, periodDays) {
  const params = [accountId];
  let dateClause = '';

  if (periodDays) {
    dateClause = 'AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    params.push(periodDays);
  }

  params.push(limit, offset);

  const [rows] = await connection.query(
    `SELECT id, direction, entry_type, amount, description, related_account, created_at
     FROM ledger_entries
     WHERE account_id = ?
     ${dateClause}
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    params
  );

  return rows;
}

async function countByAccountId(connection, accountId, periodDays) {
  const params = [accountId];
  let dateClause = '';

  if (periodDays) {
    dateClause = 'AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
    params.push(periodDays);
  }

  const [[row]] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM ledger_entries
     WHERE account_id = ?
     ${dateClause}`,
    params
  );

  return row.total;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM ledger_entries');
}

module.exports = {
  createEntry,
  findByAccountId,
  countByAccountId,
  clearAll
};
