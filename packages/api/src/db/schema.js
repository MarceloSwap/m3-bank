const pool = require('./pool');

async function ensureDatabaseStructure() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password VARCHAR(120) NOT NULL,
      cpf VARCHAR(14) NOT NULL UNIQUE,
      street VARCHAR(160) NOT NULL,
      neighborhood VARCHAR(120) NOT NULL,
      city VARCHAR(120) NOT NULL,
      state VARCHAR(2) NOT NULL,
      zip_code VARCHAR(12) NOT NULL,
      failed_login_attempts INT NOT NULL DEFAULT 0,
      lock_until DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      account_number VARCHAR(10) NOT NULL UNIQUE,
      account_digit VARCHAR(2) NOT NULL,
      balance DECIMAL(12,2) NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transfers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source_account_id INT NOT NULL,
      destination_account_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      description VARCHAR(255) NOT NULL,
      authorization_token_used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_transfer_source
        FOREIGN KEY (source_account_id) REFERENCES accounts(id),
      CONSTRAINT fk_transfer_destination
        FOREIGN KEY (destination_account_id) REFERENCES accounts(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deposits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      description VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_deposit_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_id INT NOT NULL,
      direction VARCHAR(10) NOT NULL,
      entry_type VARCHAR(60) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      description VARCHAR(255) NULL,
      related_account VARCHAR(20) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_ledger_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON DELETE CASCADE
    )
  `);
}

module.exports = {
  ensureDatabaseStructure
};
