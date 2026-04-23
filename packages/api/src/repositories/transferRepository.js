async function create(connection, transfer) {
  const [result] = await connection.query(
    `INSERT INTO transfers
      (source_account_id, destination_account_id, amount, description, authorization_token_used)
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
  await connection.query('DELETE FROM transfers');
}

module.exports = {
  create,
  clearAll
};
