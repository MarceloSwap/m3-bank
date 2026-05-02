const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;
const EMAIL   = 'qa_rn02_swagger@test.com';

describe('RN02 - Autenticação e Login (API)', () => {
  let db;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);
    await request(API_URL).post('/auth/register').send({
      name: 'QA Login Swagger', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '20022022022', createWithBalance: false
    });
  });

  after(async () => {
    if (db) {
      await db.query('SET FOREIGN_KEY_CHECKS = 0');
      await db.query(
        `DELETE contas, usuarios FROM usuarios
         LEFT JOIN contas ON usuarios.id = contas.usuario_id
         WHERE usuarios.email = ?`, [EMAIL]
      );
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
      await db.end();
    }
  });

  // CT-RN02-API-01
  it('CT-RN02-API-01 | Deve realizar login com sucesso e retornar token JWT com expiresIn 3600', async () => {
    const res = await request(API_URL).post('/auth/login').send({
      email: EMAIL, password: 'Senha@123456'
    });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    expect(res.body).to.have.property('expiresIn', 3600);
    expect(res.body).to.have.property('user').that.has.property('email', EMAIL);
    expect(res.body).to.have.property('account').that.has.property('number');
  });

  // CT-RN02-API-02
  it('CT-RN02-API-02 | Deve bloquear login com e-mail e senha ausentes — 400', async () => {
    const res = await request(API_URL).post('/auth/login').send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Usuário e senha precisam ser preenchidos');
  });

  // CT-RN02-API-03
  it('CT-RN02-API-03 | Deve bloquear login com apenas e-mail preenchido — 400', async () => {
    const res = await request(API_URL).post('/auth/login').send({ email: EMAIL });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Usuário e senha precisam ser preenchidos');
  });

  // CT-RN02-API-04
  it('CT-RN02-API-04 | Deve bloquear login com apenas senha preenchida — 400', async () => {
    const res = await request(API_URL).post('/auth/login').send({ password: 'Senha@123456' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Usuário e senha precisam ser preenchidos');
  });

  // CT-RN02-API-05
  it('CT-RN02-API-05 | Deve rejeitar login com e-mail não cadastrado — 401', async () => {
    const res = await request(API_URL).post('/auth/login').send({
      email: 'fantasma@test.com', password: 'Senha@123456'
    });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Credenciais inválidas');
  });

  // CT-RN02-API-06
  it('CT-RN02-API-06 | Deve rejeitar login com senha incorreta — 401', async () => {
    const res = await request(API_URL).post('/auth/login').send({
      email: EMAIL, password: 'SenhaErrada999'
    });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Credenciais inválidas');
  });

  // CT-RN02-API-07 — Segurança: rotas protegidas sem token devem retornar 401
  it('CT-RN02-API-07 | Deve retornar 401 ao acessar GET /accounts/me sem token JWT', async () => {
    const res = await request(API_URL).get('/accounts/me');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  it('CT-RN02-API-07b | Deve retornar 401 ao acessar GET /accounts/statement sem token JWT', async () => {
    const res = await request(API_URL).get('/accounts/statement');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  it('CT-RN02-API-07c | Deve retornar 401 ao acessar POST /transfers sem token JWT', async () => {
    const res = await request(API_URL).post('/transfers').send({});
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  it('CT-RN02-API-07d | Deve retornar 401 ao acessar POST /deposits sem token JWT', async () => {
    const res = await request(API_URL).post('/deposits').send({});
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  it('CT-RN02-API-07e | Deve retornar 401 ao acessar POST /payments/pix/simulate sem token JWT', async () => {
    const res = await request(API_URL).post('/payments/pix/simulate').send({});
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });
});
