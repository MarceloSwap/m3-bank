/**
 * Cleanup Tests Script - Surgical Data Cleanup
 * 
 * Removes ONLY test data created during automation:
 * - Users with names starting with "qa_"
 * - Users with emails ending in "@test.com"
 * - All transactions related to these users
 * 
 * This preserves manual exploratory testing data and production-like records
 */

const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'm3_bank'
};

const QA_PREFIX = 'qa_';
const TEST_DOMAIN = '@test.com';

async function cleanupTests() {
  let connection;
  
  try {
    console.log('🧹 Iniciando limpeza cirúrgica de dados de teste...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);
    
    // Start transaction for data consistency
    await connection.beginTransaction();
    
    // Step 1: Find all test users (by prefix or domain)
    console.log(`📋 Procurando usuários com prefixo "${QA_PREFIX}" ou domínio "${TEST_DOMAIN}"...`);
    
    const [testUsers] = await connection.query(
      `SELECT id FROM usuarios 
       WHERE nome LIKE CONCAT(?, '%') OR email LIKE CONCAT('%', ?)`,
      [QA_PREFIX, TEST_DOMAIN]
    );
    
    if (testUsers.length === 0) {
      console.log('✅ Nenhum usuário de teste encontrado. Nada a limpar.\n');
      await connection.commit();
      await connection.end();
      return;
    }
    
    const testUserIds = testUsers.map(u => u.id);
    console.log(`   Encontrados ${testUsers.length} usuários de teste\n`);
    
    // Step 2: Get test accounts
    console.log('📋 Procurando contas associadas aos usuários de teste...');
    
    const [testAccounts] = await connection.query(
      `SELECT id FROM contas WHERE usuario_id IN (?)`,
      [testUserIds]
    );
    
    if (testAccounts.length === 0) {
      console.log('   Nenhuma conta encontrada\n');
    } else {
      console.log(`   Encontradas ${testAccounts.length} contas de teste\n`);
    }
    
    const testAccountIds = testAccounts.map(a => a.id);
    
    // Step 3: Delete transactions (VERY CAREFUL - preserves data integrity)
    if (testAccountIds.length > 0) {
      console.log('🗑️  Deletando transações de teste...');
      
      // Delete transfers where origin or destination is a test account
      const [transferResult] = await connection.query(
        `DELETE FROM transferencias 
         WHERE conta_origem_id IN (?) OR conta_destino_id IN (?)`,
        [testAccountIds, testAccountIds]
      );
      console.log(`   ✓ ${transferResult.affectedRows} transferências deletadas`);
      
      // Delete deposits
      const [depositResult] = await connection.query(
        `DELETE FROM depositos WHERE conta_destino_id IN (?)`,
        [testAccountIds]
      );
      console.log(`   ✓ ${depositResult.affectedRows} depósitos deletados`);
      
      // Delete payments
      const [paymentResult] = await connection.query(
        `DELETE FROM pagamentos_pix WHERE conta_id IN (?)`,
        [testAccountIds]
      );
      console.log(`   ✓ ${paymentResult.affectedRows} pagamentos deletados`);
      
      // Delete statements
      const [statementResult] = await connection.query(
        `DELETE FROM lancamentos WHERE conta_id IN (?)`,
        [testAccountIds]
      );
      console.log(`   ✓ ${statementResult.affectedRows} lançamentos deletados\n`);
    }
    
    // Step 4: Delete test accounts
    console.log('🗑️  Deletando contas de teste...');
    
    const [accountDeleteResult] = await connection.query(
      `DELETE FROM contas WHERE id IN (?)`,
      [testAccountIds.length > 0 ? testAccountIds : [-1]]
    );
    console.log(`   ✓ ${accountDeleteResult.affectedRows} contas deletadas\n`);
    
    // Step 5: Delete test users
    console.log('🗑️  Deletando usuários de teste...');
    
    const [userDeleteResult] = await connection.query(
      `DELETE FROM usuarios WHERE id IN (?)`,
      [testUserIds]
    );
    console.log(`   ✓ ${userDeleteResult.affectedRows} usuários deletados\n`);
    
    // Commit transaction
    await connection.commit();
    
    console.log('✅ Limpeza cirúrgica concluída com sucesso!');
    console.log(`   Total de usuários removidos: ${userDeleteResult.affectedRows}`);
    console.log(`   Total de contas removidas: ${accountDeleteResult.affectedRows}`);
    console.log(`   Dados de testes exploratórios preservados ✓\n`);
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Erro durante a limpeza:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run cleanup
cleanupTests();
