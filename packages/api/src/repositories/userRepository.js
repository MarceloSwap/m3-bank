async function findByEmail(connection, email) {
  const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(connection, id) {
  const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(connection, user) {
  const [result] = await connection.query(
    `INSERT INTO users
      (name, email, password, cpf, street, neighborhood, city, state, zip_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.name,
      user.email,
      user.password,
      user.cpf,
      user.street,
      user.neighborhood,
      user.city,
      user.state,
      user.zipCode
    ]
  );

  return result.insertId;
}

async function updateLoginAttempts(connection, userId, failedLoginAttempts, lockUntil) {
  await connection.query(
    'UPDATE users SET failed_login_attempts = ?, lock_until = ? WHERE id = ?',
    [failedLoginAttempts, lockUntil, userId]
  );
}

async function resetLoginAttempts(connection, userId) {
  await connection.query(
    'UPDATE users SET failed_login_attempts = 0, lock_until = NULL WHERE id = ?',
    [userId]
  );
}

async function updateName(connection, userId, name) {
  await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
}

async function updatePassword(connection, userId, password) {
  await connection.query('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
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
