const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;

describe('RN06 - Extrato Paginado (API)', () => {
  let dbConnection;
  let userToken;
  let userAccount;
  const emailUser = 'qa_api_extrato@test.com';

  before(async () => {
    dbConnection = await mysql.createConnection(global.DB_CONFIG);
    
    const resRegister = await request(API_URL).post('/auth/register').send({
      name: 'QA Extrato', email: emailUser, password: 'Senha@123456', confirmPassword: 'Senha@123456', cpf: '88877766655', createWithBalance: false
    });
    
    const resLogin = await request(API_URL).post('/auth/login').send({ email: emailUser, password: 'Senha@123456' });
    userToken = resLogin.body.token;
    userAccount = { accountNumber: resLogin.body.account.number, accountDigit: resLogin.body.account.digit };

    await request(API_URL).post('/deposits').set('Authorization', `Bearer ${userToken}`).send({
      accountNumber: userAccount.accountNumber, accountDigit: userAccount.accountDigit, amount: 250, description: 'deposito para extrato'
    });
  });

  it('Deve retornar o extrato da conta com as movimentações', async () => {
    const response = await request(API_URL)
      .get('/accounts/statement?page=1&limit=10')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('balance');
    expect(response.body).to.have.property('entries').that.is.an('array');
    expect(response.body.entries.length).to.be.greaterThan(0);
  });

  after(async () => {
    if (dbConnection) {
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 0');
      await dbConnection.query(`
        DELETE contas, usuarios FROM usuarios 
        LEFT JOIN contas ON usuarios.id = contas.usuario_id 
        WHERE usuarios.email = ?`, [emailUser]
      );
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 1');
      await dbConnection.end();
    }
  });
});