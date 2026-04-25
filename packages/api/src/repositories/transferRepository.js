async function create(connection, transfer) {
  const [result] = await connection.query(
    `INSERT INTO transferencias
      (conta_origem_id, conta_destino_id, valor, descricao, token_autorizacao_usado)
     VALUES (?, ?, ?, ?, ?)`,
    [
      transfer.sourceAccountId,
      transfer.destinationAccountId,
      transfer.amount,
      transfer.description,
      transfer.authorizationTokenUsed
    ]
  );

  return result.insertId;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM transferencias');
}

module.exports = {
  create,
  clearAll
};
