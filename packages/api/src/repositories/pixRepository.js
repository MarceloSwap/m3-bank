async function create(connection, payment) {
  const [result] = await connection.query(
    `INSERT INTO pix_payments (account_id, amount, description, qr_code_reference)
     VALUES (?, ?, ?, ?)`,
    [payment.accountId, payment.amount, payment.description, payment.qrCodeReference]
  );

  return result.insertId;
}

async function clearAll(connection) {
  await connection.query('DELETE FROM pix_payments');
}

module.exports = {
  create,
  clearAll
};
