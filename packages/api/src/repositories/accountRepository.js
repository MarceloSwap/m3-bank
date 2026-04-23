async function create(connection, userId, accountNumber, accountDigit, balance) {
  const [result] = await connection.query(
    'INSERT INTO accounts (user_id, account_number, account_digit, balance) VALUES (?, ?, ?, ?)',
    [userId, accountNumber, accountDigit, balance]
  );

  return result.insertId;
}

async function findByUserId(connection, userId) {
  const [rows] = await connection.query(
    `SELECT a.*, u.name, u.email, u.cpf, u.street, u.neighborhood, u.city, u.state, u.zip_code
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.user_id = ?`,
    [userId]
  );

  return rows[0] || null;
}

async function findByNumberAndDigit(connection, accountNumber, accountDigit) {
  const [rows] = await connection.query(
    `SELECT a.*, u.name, u.email
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.account_number = ? AND a.account_digit = ?`,
    [accountNumber, accountDigit]
  );

  return rows[0] || null;
}

async function findAllActive(connection) {
  const [rows] = await connection.query(
    `SELECT a.id, a.account_number, a.account_digit, a.balance, a.active, u.name, u.email
     FROM accounts a
     JOIN users u ON u.id = a.user_id
     WHERE a.active = TRUE
     ORDER BY u.name ASC`
  );

  return rows;
}

async function updateBalance(connection, accountId, newBalance) {
  await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);
}

async function existsAny(connection) {
  const [[row]] = await connection.query('SELECT COUNT(*) AS total FROM accounts');
  return row.total > 0;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM accounts');
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
