const fs = require('fs');
const path = require('path');
const pool = require('../src/db/pool');
const { ensureDatabaseStructure } = require('../src/db/schema');
const userRepository = require('../src/repositories/userRepository');
const accountRepository = require('../src/repositories/accountRepository');
const transferRepository = require('../src/repositories/transferRepository');
const pixRepository = require('../src/repositories/pixRepository');
const statementRepository = require('../src/repositories/statementRepository');

function loadSeedFile() {
  const filePath = path.resolve(__dirname, './seed.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildAccountNumbers(userId) {
  const base = String(100000 + userId);
  const accountNumber = base.slice(-6);
  const accountDigit = String((userId * 7) % 10);

  return { accountNumber, accountDigit };
}

async function run() {
  const seed = loadSeedFile();
  const connection = await pool.getConnection();

  try {
    await ensureDatabaseStructure();
    await connection.beginTransaction();

    const [existingUser] = await Promise.all([
      userRepository.findByEmail(connection, seed.users[0].email)
    ]);

    if (existingUser) {
      console.log('Seed já aplicada, nenhuma alteração necessária.');
      await connection.rollback();
      return;
    }

    await statementRepository.clearAll(connection);
    await transferRepository.clearAll(connection);
    await pixRepository.clearAll(connection);
    await accountRepository.clearAll(connection);
    await connection.query('DELETE FROM usuarios');

    for (const user of seed.users) {
      const userId = await userRepository.create(connection, {
        name: user.name,
        email: user.email,
        password: user.password,
        cpf: user.cpf
      });

      const { accountNumber, accountDigit } = buildAccountNumbers(userId);
      const balance = Number(user.balance ?? (user.createWithBalance ? 1000 : 0));
      const accountId = await accountRepository.create(connection, userId, accountNumber, accountDigit, balance);

      await statementRepository.createEntry(connection, {
        accountId,
        direction: 'credit',
        entryType: 'Abertura de conta',
        amount: balance,
        description: 'Carga inicial do seed',
        relatedAccount: null
      });
    }

    await connection.commit();
    console.log('Seed aplicada com sucesso.');
  } catch (error) {
    await connection.rollback();
    console.error('Falha ao executar seed:', error.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

run();
