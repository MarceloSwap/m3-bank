async function create(connection, userId, accountNumber, accountDigit, balance) {
  const [result] = await connection.query(
    'INSERT INTO contas (usuario_id, numero_conta, digito_conta, saldo) VALUES (?, ?, ?, ?)',
    [userId, accountNumber, accountDigit, balance]
  );

  return result.insertId;
}

async function findByUserId(connection, userId) {
  const [rows] = await connection.query(
    `SELECT c.*, u.nome, u.email, u.cpf
     FROM contas c
     JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.usuario_id = ?`,
    [userId]
  );

  return rows[0] || null;
}

async function findByNumberAndDigit(connection, accountNumber, accountDigit) {
  const [rows] = await connection.query(
    `SELECT c.*, u.nome, u.email
     FROM contas c
     JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.numero_conta = ? AND c.digito_conta = ?`,
    [accountNumber, accountDigit]
  );

  return rows[0] || null;
}

async function findAllActive(connection) {
  const [rows] = await connection.query(
    `SELECT c.id, c.numero_conta, c.digito_conta, c.saldo, c.ativa, u.nome, u.email
     FROM contas c
     JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.ativa = TRUE
     ORDER BY u.nome ASC`
  );

  return rows;
}

async function updateBalance(connection, accountId, newBalance) {
  await connection.query('UPDATE contas SET saldo = ? WHERE id = ?', [newBalance, accountId]);
}

async function existsAny(connection) {
  const [[row]] = await connection.query('SELECT COUNT(*) AS total FROM contas');
  return row.total > 0;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM contas');
}

module.exports = {
  create,
  findByUserId,
  findByNumberAndDigit,
  findAllActive,
  updateBalance,
  existsAny,
  clearAll
};
