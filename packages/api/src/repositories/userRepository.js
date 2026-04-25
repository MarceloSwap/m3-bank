async function findByEmail(connection, email) {
  const [rows] = await connection.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(connection, id) {
  const [rows] = await connection.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(connection, user) {
  const [result] = await connection.query(
    `INSERT INTO usuarios
      (nome, email, senha, cpf)
     VALUES (?, ?, ?, ?)`,
    [
      user.name,
      user.email,
      user.password,
      user.cpf
    ]
  );

  return result.insertId;
}

async function updateLoginAttempts(connection, userId, failedLoginAttempts, lockUntil) {
  await connection.query(
    'UPDATE usuarios SET tentativas_falha_login = ?, bloqueado_ate = ? WHERE id = ?',
    [failedLoginAttempts, lockUntil, userId]
  );
}

async function resetLoginAttempts(connection, userId) {
  await connection.query(
    'UPDATE usuarios SET tentativas_falha_login = 0, bloqueado_ate = NULL WHERE id = ?',
    [userId]
  );
}

async function updateName(connection, userId, name) {
  await connection.query('UPDATE usuarios SET nome = ? WHERE id = ?', [name, userId]);
}

async function updatePassword(connection, userId, password) {
  await connection.query('UPDATE usuarios SET senha = ? WHERE id = ?', [password, userId]);
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateLoginAttempts,
  resetLoginAttempts,
  updateName,
  updatePassword
};
