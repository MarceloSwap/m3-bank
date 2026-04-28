const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');
const payloadCadastro = require('../../fixtures/cadastro-payload.json');

const API_URL = 'http://localhost:3334/api';

describe('RN01 - Cadastro de Contas (API)', () => {
  let dbConnection;

  before(async () => {
    // Agora pegando tudo do seu .env com valores padrão caso falhe
    dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'm3_bank'
    });
  });

  it('Deve cadastrar um usuário com sucesso e saldo inicial de 1000', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send(payloadCadastro);

    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('message', 'Conta criada com sucesso');
    expect(response.body).to.have.property('accountNumber');
    expect(response.body).to.have.property('initialBalance', 1000);
  });

  it('Deve bloquear o cadastro de um e-mail já existente (Erro 400)', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send({
        name: 'Tentativa Duplicada',
        email: payloadCadastro.email, // Tentando o mesmo e-mail do teste acima
        password: 'Senha@123456',
        confirmPassword: 'Senha@123456',
        cpf: '00011122233',
        createWithBalance: false
      });

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message', 'E-mail já cadastrado');
  });

  after(async () => {
    if (dbConnection) {
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 0');
      await dbConnection.query(`
        DELETE contas, usuarios FROM usuarios 
        LEFT JOIN contas ON usuarios.id = contas.usuario_id 
        WHERE usuarios.email = ?`, [payloadCadastro.email]
      );
      await dbConnection.query('SET FOREIGN_KEY_CHECKS = 1');
      await dbConnection.end();
    }
  });
});