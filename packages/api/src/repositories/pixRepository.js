async function create(connection, payment) {
  const [result] = await connection.query(
    `INSERT INTO pagamentos_pix (conta_id, valor, descricao, referencia_qr_code)
     VALUES (?, ?, ?, ?)`,
    [payment.accountId, payment.amount, payment.description, payment.qrCodeReference]
  );

  return result.insertId;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM pagamentos_pix');
}

module.exports = {
  create,
  clearAll
};
