const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');
const loginFixture = require('../../fixtures/login-payload.json');

const API_URL = global.API_BASE_URL;

describe('RN02 - Login com Sucesso (API)', () => {
  let dbConnection;

  before(async () => {
    // Usando a Configuração Global Protegida
    dbConnection = await mysql.createConnection(global.DB_CONFIG);

    const userPayload = {
      name: 'qa_api_login_001',
      email: loginFixture.email,
      password: loginFixture.password,
      confirmPassword: loginFixture.password,
      cpf: '11122233344',
      createWithBalance: false
    };

    await request(API_URL).post('/auth/register').send(userPayload);
  });

  it('Deve realizar login com sucesso e retornar um Token JWT válido', async () => {
    const response = await request(API_URL).post('/auth/login').send(loginFixture);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
  });

  it('Deve bloquear o login com senha incorreta (Erro 401)', async () => {
    const response = await request(API_URL).post('/auth/login').send({
      email: loginFixture.email,
      password: 'SenhaErrada123'
    });
    expect(response.status).to.equal(401);
  });

  after(async () => {
    if (dbConnection) {
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 0');
      await dbConnection.query(`
        DELETE contas, usuarios FROM usuarios 
        LEFT JOIN contas ON usuarios.id = contas.usuario_id 
        WHERE usuarios.email = ?`, [loginFixture.email]);
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 1');
      await dbConnection.end();
    }
  });
});