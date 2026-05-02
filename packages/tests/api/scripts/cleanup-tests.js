/**
 * cleanup-tests.js
 * Limpeza cirúrgica de dados gerados pela automação de testes.
 *
 * Cobre todos os padrões usados nos specs e no Cypress:
 *   - emails terminando em @test.com        (Supertest/Mocha)
 *   - emails terminando em @m3bank.test     (Cypress)
 *   - nomes começando com qa_               (ambos)
 *   - nomes começando com QA                (Cypress — criarUsuarioApi)
 *   - emails do auditor VADER               (VADER-api.spec.js)
 *
 * Uso:
 *   node cleanup-tests.js            → executa a limpeza
 *   node cleanup-tests.js --dry-run  → só mostra o que seria deletado, sem apagar nada
 *   node cleanup-tests.js --report   → só mostra contagem atual, sem apagar nada
 */

const mysql = require('mysql2/promise');
const path  = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const REPORT_ONLY = process.argv.includes('--report');

const DB_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'm3_bank'
};

// Padrões que identificam dados de teste — NÃO altere sem revisar os specs
const TEST_PATTERNS = {
  emailDomains: ['@test.com', '@m3bank.test'],
  namePrefixes: ['qa_', 'QA '],
  exactEmails:  ['auditoria_vader@m3bank.test']
};

function buildWhereClause() {
  const conditions = [
    ...TEST_PATTERNS.emailDomains.map(() => `email LIKE CONCAT('%', ?)`),
    ...TEST_PATTERNS.namePrefixes.map(() => `nome LIKE CONCAT(?, '%')`),
    ...TEST_PATTERNS.exactEmails.map(() => `email = ?`)
  ];
  const values = [
    ...TEST_PATTERNS.emailDomains,
    ...TEST_PATTERNS.namePrefixes,
    ...TEST_PATTERNS.exactEmails
  ];
  return { where: conditions.join(' OR '), values };
}

async function getReport(connection) {
  const { where, values } = buildWhereClause();

  const [[{ total: totalUsers }]] = await connection.query(
    `SELECT COUNT(*) as total FROM usuarios WHERE ${where}`, values
  );

  const [testUsers] = await connection.query(
    `SELECT id FROM usuarios WHERE ${where}`, values
  );
  const ids = testUsers.map(u => u.id);

  if (ids.length === 0) {
    return { totalUsers: 0, totalAccounts: 0, totalTransfers: 0,
             totalDeposits: 0, totalPix: 0, totalEntries: 0, ids: [] };
  }

  const [[{ totalAccounts }]] = await connection.query(
    `SELECT COUNT(*) as totalAccounts FROM contas WHERE usuario_id IN (?)`, [ids]
  );

  const [accounts] = await connection.query(
    `SELECT id FROM contas WHERE usuario_id IN (?)`, [ids]
  );
  const accountIds = accounts.map(a => a.id);

  if (accountIds.length === 0) {
    return { totalUsers, totalAccounts: 0, totalTransfers: 0,
             totalDeposits: 0, totalPix: 0, totalEntries: 0, ids };
  }

  const [[{ totalTransfers }]] = await connection.query(
    `SELECT COUNT(*) as totalTransfers FROM transferencias
     WHERE conta_origem_id IN (?) OR conta_destino_id IN (?)`,
    [accountIds, accountIds]
  );
  const [[{ totalDeposits }]] = await connection.query(
    `SELECT COUNT(*) as totalDeposits FROM depositos WHERE conta_id IN (?)`, [accountIds]
  );
  const [[{ totalPix }]] = await connection.query(
    `SELECT COUNT(*) as totalPix FROM pagamentos_pix WHERE conta_id IN (?)`, [accountIds]
  );
  const [[{ totalEntries }]] = await connection.query(
    `SELECT COUNT(*) as totalEntries FROM lancamentos WHERE conta_id IN (?)`, [accountIds]
  );

  return { totalUsers, totalAccounts, totalTransfers,
           totalDeposits, totalPix, totalEntries, ids, accountIds };
}

async function run() {
  let connection;

  try {
    connection = await mysql.createConnection(DB_CONFIG);

    const mode = DRY_RUN ? ' [DRY-RUN]' : REPORT_ONLY ? ' [REPORT]' : '';
    console.log(`\n🧹 M3 Bank — Limpeza de Dados de Teste${mode}`);
    console.log('─'.repeat(50));

    const report = await getReport(connection);

    console.log('\n📊 Dados de teste encontrados:');
    console.log(`   👤 Usuários:      ${report.totalUsers}`);
    console.log(`   🏦 Contas:        ${report.totalAccounts}`);
    console.log(`   💸 Transferências: ${report.totalTransfers}`);
    console.log(`   💰 Depósitos:     ${report.totalDeposits}`);
    console.log(`   📱 Pagamentos Pix: ${report.totalPix}`);
    console.log(`   📋 Lançamentos:   ${report.totalEntries}`);

    if (report.totalUsers === 0) {
      console.log('\n✅ Banco limpo — nenhum dado de teste encontrado.\n');
      return;
    }

    if (REPORT_ONLY || DRY_RUN) {
      if (DRY_RUN) {
        console.log('\n⚠️  Modo DRY-RUN — nenhum dado foi apagado.');
        console.log('   Execute sem --dry-run para realizar a limpeza.\n');
      }
      return;
    }

    // Executa a limpeza
    console.log('\n🗑️  Iniciando limpeza...');
    await connection.beginTransaction();

    const { accountIds, ids } = report;

    if (accountIds && accountIds.length > 0) {
      const [r1] = await connection.query(
        `DELETE FROM transferencias WHERE conta_origem_id IN (?) OR conta_destino_id IN (?)`,
        [accountIds, accountIds]
      );
      console.log(`   ✓ ${r1.affectedRows} transferências removidas`);

      const [r2] = await connection.query(
        `DELETE FROM depositos WHERE conta_id IN (?)`, [accountIds]
      );
      console.log(`   ✓ ${r2.affectedRows} depósitos removidos`);

      const [r3] = await connection.query(
        `DELETE FROM pagamentos_pix WHERE conta_id IN (?)`, [accountIds]
      );
      console.log(`   ✓ ${r3.affectedRows} pagamentos Pix removidos`);

      const [r4] = await connection.query(
        `DELETE FROM lancamentos WHERE conta_id IN (?)`, [accountIds]
      );
      console.log(`   ✓ ${r4.affectedRows} lançamentos removidos`);

      const [r5] = await connection.query(
        `DELETE FROM contas WHERE id IN (?)`, [accountIds]
      );
      console.log(`   ✓ ${r5.affectedRows} contas removidas`);
    }

    const { where, values } = buildWhereClause();
    const [r6] = await connection.query(
      `DELETE FROM usuarios WHERE ${where}`, values
    );
    console.log(`   ✓ ${r6.affectedRows} usuários removidos`);

    await connection.commit();

    console.log('\n✅ Limpeza concluída com sucesso!');
    console.log('   Dados de seed e exploratórios preservados.\n');

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('\n❌ Erro durante a limpeza:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
