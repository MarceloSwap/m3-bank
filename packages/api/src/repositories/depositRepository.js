async function create(connection, depositData) {
  const { accountId, amount, description } = depositData;

  const [result] = await connection.query(
    'INSERT INTO depositos (conta_id, valor, descricao) VALUES (?, ?, ?)',
    [accountId, amount, description]
  );

  return result.insertId;
}

module.exports = {
  create
};