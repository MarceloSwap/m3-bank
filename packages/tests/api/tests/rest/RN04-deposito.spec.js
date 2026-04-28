const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;

describe('RN04 - Depósito (API)', () => {
  let dbConnection;
  let userToken;
  let userAccount;
  const emailUser = 'qa_api_deposito@test.com';

  before(async () => {
    dbConnection = await mysql.createConnection(global.DB_CONFIG);

    await request(API_URL).post('/auth/register').send({
      name: 'QA Deposito', email: emailUser, password: 'Senha@123456', confirmPassword: 'Senha@123456', cpf: '33344455566', createWithBalance: false
    });
    
    const resLogin = await request(API_URL).post('/auth/login').send({
      email: emailUser, password: 'Senha@123456'
    });
    userToken = resLogin.body.token;
    userAccount = {
      accountNumber: resLogin.body.account.number,
      accountDigit: resLogin.body.account.digit
    };
  });

  it('Deve realizar um depósito com sucesso', async () => {
    const response = await request(API_URL)
      .post('/deposits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        accountNumber: userAccount.accountNumber,
        accountDigit: userAccount.accountDigit,
        amount: 500,
        description: 'qa_deposito_teste'
      });

    expect(response.status).to.equal(201);
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