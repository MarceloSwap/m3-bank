/**
 * seed.js
 * Popula o banco m3_bank com dados iniciais de demonstração.
 *
 * Usuários criados (definidos em seed.json):
 *   - Ana Juruti      | ana.juruti@m3bank.test     | saldo R$ 3.350,00
 *   - Bruno Solimoes  | bruno.solimoes@m3bank.test  | saldo R$ 7.800,00
 *   - Carla Tapajos   | carla.tapajos@m3bank.test   | saldo R$ 0,00
 *
 * Idempotente: pula usuários cujo e-mail já existe no banco.
 * Cria as tabelas automaticamente se não existirem.
 *
 * Uso:
 *   npm run seed          (na raiz do projeto)
 *   node scripts/seed.js  (dentro de packages/api)
 */

const path   = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');

// .env está em packages/api/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedData = require('./seed.json');

const DB_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'm3_bank'
};

const SALT_ROUNDS = 10;

function buildAccountNumbers(userId) {
  const base = String(100000 + userId);
  const accountNumber = base.slice(-6);
  const digit = String((userId * 7) % 10);
  return { accountNumber, digit };
}

async function ensureTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      senha VARCHAR(120) NOT NULL,
      cpf VARCHAR(14) NOT NULL UNIQUE,
      tentativas_falha_login INT NOT NULL DEFAULT 0,
      bloqueado_ate DATETIME NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS contas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      numero_conta VARCHAR(10) NOT NULL UNIQUE,
      digito_conta VARCHAR(2) NOT NULL,
      saldo DECIMAL(12,2) NOT NULL DEFAULT 0,
      ativa BOOLEAN NOT NULL DEFAULT TRUE,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_contas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS transferencias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conta_origem_id INT NOT NULL,
      conta_destino_id INT NOT NULL,
      valor DECIMAL(12,2) NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      token_autorizacao_usado BOOLEAN NOT NULL DEFAULT FALSE,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_transferencia_origem
        FOREIGN KEY (conta_origem_id) REFERENCES contas(id),
      CONSTRAINT fk_transferencia_destino
        FOREIGN KEY (conta_destino_id) REFERENCES contas(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS depositos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conta_id INT NOT NULL,
      valor DECIMAL(12,2) NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_deposito_conta
        FOREIGN KEY (conta_id) REFERENCES contas(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS pagamentos_pix (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conta_id INT NOT NULL,
      valor DECIMAL(12,2) NOT NULL,
      descricao VARCHAR(255) NOT NULL,
      referencia_qr_code VARCHAR(255) NOT NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pagamento_pix_conta
        FOREIGN KEY (conta_id) REFERENCES contas(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conta_id INT NOT NULL,
      direcao VARCHAR(10) NOT NULL,
      tipo_lancamento VARCHAR(60) NOT NULL,
      valor DECIMAL(12,2) NOT NULL,
      descricao VARCHAR(255) NULL,
      conta_relacionada VARCHAR(20) NULL,
      nome_favorecido VARCHAR(120) NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_lancamento_conta
        FOREIGN KEY (conta_id) REFERENCES contas(id)
        ON DELETE CASCADE
    )
  `);

  console.log('   ✅ Tabelas verificadas/criadas');
}

async function run() {
  let connection;

  try {
    console.log('\n🌱 M3 Bank — Seed de Dados Iniciais');
    console.log('─'.repeat(40));

    connection = await mysql.createConnection(DB_CONFIG);

    await ensureTables(connection);

    let criados = 0;
    let pulados = 0;

    for (const user of seedData.users) {
      // Verifica se já existe
      const [existing] = await connection.query(
        'SELECT id FROM usuarios WHERE email = ?', [user.email]
      );

      if (existing.length > 0) {
        console.log(`   ⏭  Pulando ${user.email} — já existe`);
        pulados++;
        continue;
      }

      await connection.beginTransaction();

      try {
        const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

        const [userResult] = await connection.query(
          `INSERT INTO usuarios (nome, email, senha, cpf) VALUES (?, ?, ?, ?)`,
          [user.name, user.email, passwordHash, user.cpf]
        );

        const userId = userResult.insertId;
        const { accountNumber, digit } = buildAccountNumbers(userId);
        const balance = user.balance ?? (user.createWithBalance ? 1000 : 0);

        const [accountResult] = await connection.query(
          `INSERT INTO contas (usuario_id, numero_conta, digito_conta, saldo) VALUES (?, ?, ?, ?)`,
          [userId, accountNumber, digit, balance]
        );

        const accountId = accountResult.insertId;

        await connection.query(
          `INSERT INTO lancamentos
             (conta_id, direcao, tipo_lancamento, valor, descricao, nome_favorecido)
           VALUES (?, 'credit', 'Abertura de conta', ?, 'Conta criada no M3 Bank', ?)`,
          [accountId, balance, user.name]
        );

        await connection.commit();

        console.log(`   ✅ ${user.name}`);
        console.log(`      📧 E-mail: ${user.email}`);
        console.log(`      🔑 Senha:  ${user.password}`);
        console.log(`      🏦 Conta:  ${accountNumber}-${digit} | Saldo R$ ${Number(balance).toFixed(2)}`);
        criados++;

      } catch (err) {
        await connection.rollback();
        throw err;
      }
    }

    console.log('─'.repeat(40));
    console.log(`✅ Seed concluído — ${criados} criado(s), ${pulados} pulado(s).`);
    console.log('\n📋 Credenciais dos usuários de demonstração:');
    console.log('─'.repeat(40));
    for (const user of seedData.users) {
      console.log(`   👤 ${user.name}`);
      console.log(`      📧 E-mail: ${user.email}`);
      console.log(`      🔑 Senha:  ${user.password}`);
    }
    console.log('─'.repeat(40) + '\n');

  } catch (error) {
    console.error('\n❌ Erro no seed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
