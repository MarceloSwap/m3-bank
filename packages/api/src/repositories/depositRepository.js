async function create(connection, depositData) {
  const { accountId, amount, description } = depositData;

  const [result] = await connection.query(
    'INSERT INTO deposits (account_id, amount, description) VALUES (?, ?, ?)',
    [accountId, amount, description]
  );

  return result.insertId;
}

module.exports = {
  create
};