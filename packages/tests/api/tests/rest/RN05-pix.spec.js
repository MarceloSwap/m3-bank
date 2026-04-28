const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;

describe('RN05 - Pagamento PIX (API)', () => {
  let dbConnection;
  let userToken;
  const emailUser = 'qa_api_pix@test.com';

  before(async () => {
    dbConnection = await mysql.createConnection(global.DB_CONFIG);

    await request(API_URL).post('/auth/register').send({
      name: 'QA PIX', email: emailUser, password: 'Senha@123456', confirmPassword: 'Senha@123456', cpf: '99911122233', createWithBalance: true
    });

    const resLogin = await request(API_URL).post('/auth/login').send({
      email: emailUser, password: 'Senha@123456'
    });
    userToken = resLogin.body.token;
  });

  it('Deve simular um pagamento PIX com sucesso', async () => {
    const response = await request(API_URL)
      .post('/payments/pix/simulate')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 150.50,
        description: 'qa_pagamento_pix'
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