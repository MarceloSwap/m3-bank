const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;

describe('RN03 - Transferência Diurna (API)', () => {
  let dbConnection;
  let senderToken;
  let receiverAccount;
  const emailSender = 'qa_api_sender@test.com';
  const emailReceiver = 'qa_api_receiver@test.com';

  before(async () => {
    dbConnection = await mysql.createConnection(global.DB_CONFIG);

    const resReceiver = await request(API_URL).post('/auth/register').send({
      name: 'QA Receiver', email: emailReceiver, password: 'Senha@123456', confirmPassword: 'Senha@123456', cpf: '22233344455', createWithBalance: false
    });
    receiverAccount = { accountNumber: resReceiver.body.accountNumber, accountDigit: resReceiver.body.accountDigit };

    await request(API_URL).post('/auth/register').send({
      name: 'QA Sender', email: emailSender, password: 'Senha@123456', confirmPassword: 'Senha@123456', cpf: '55566677788', createWithBalance: true
    });

    const resLogin = await request(API_URL).post('/auth/login').send({ email: emailSender, password: 'Senha@123456' });
    senderToken = resLogin.body.token;
  });

  it('Deve realizar uma transferência com sucesso entre duas contas', async () => {
    const response = await request(API_URL)
      .post('/transfers')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        accountNumber: receiverAccount.accountNumber,
        accountDigit: receiverAccount.accountDigit,
        amount: 150,
        description: 'qa_transferencia_automatizada'
      });
    expect(response.status).to.equal(201);
  });

  after(async () => {
    if (dbConnection) {
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 0');
      await dbConnection.query(`
        DELETE contas, usuarios FROM usuarios 
        LEFT JOIN contas ON usuarios.id = contas.usuario_id 
        WHERE usuarios.email IN (?, ?)`, [emailSender, emailReceiver]);
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 1');
      await dbConnection.end();
    }
  });
});