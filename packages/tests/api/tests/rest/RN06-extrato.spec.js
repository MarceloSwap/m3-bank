const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;
const EMAIL   = 'qa_rn06_swagger@test.com';

describe('RN06 - Extrato e Saldo (API)', () => {
  let db, token, conta;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);
    await request(API_URL).post('/auth/register').send({
      name: 'QA Extrato Swagger', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '70077077077', createWithBalance: true
    });
    const res = await request(API_URL).post('/auth/login').send({ email: EMAIL, password: 'Senha@123456' });
    token = res.body.token;
    conta = { accountNumber: res.body.account.number, accountDigit: res.body.account.digit };

    // Gera lançamento adicional para garantir extrato não vazio
    await request(API_URL).post('/deposits')
      .set('Authorization', `Bearer ${token}`)
      .send({ accountNumber: conta.accountNumber, accountDigit: conta.accountDigit, amount: 100, description: 'QA setup extrato' });
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

  const autorizacao = () => ({ Authorization: `Bearer ${token}` });

  // CT-RN06-API-01
  it('CT-RN06-API-01 | Deve retornar extrato paginado com schema completo — page, limit, total, balance e entries — 200', async () => {
    const res = await request(API_URL).get('/accounts/statement?page=1&limit=10&periodDays=30')
      .set(autorizacao());
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('page', 1);
    expect(res.body).to.have.property('limit', 10);
    expect(res.body).to.have.property('total').that.is.a('number');
    expect(res.body).to.have.property('balance').that.is.a('number');
    expect(res.body).to.have.property('entries').that.is.an('array');
  });

  // CT-RN06-API-02
  it('CT-RN06-API-02 | Deve filtrar extrato pelos últimos 7 dias — periodDays=7 — 200', async () => {
    const res = await request(API_URL).get('/accounts/statement?periodDays=7').set(autorizacao());
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('periodDays', 7);
  });

  // CT-RN06-API-03
  it('CT-RN06-API-03 | Deve filtrar extrato pelos últimos 15 dias — periodDays=15 — 200', async () => {
    const res = await request(API_URL).get('/accounts/statement?periodDays=15').set(autorizacao());
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('periodDays', 15);
  });

  // CT-RN06-API-04
  it('CT-RN06-API-04 | Deve usar período padrão de 30 dias quando periodDays for inválido — 200', async () => {
    const res = await request(API_URL).get('/accounts/statement?periodDays=99').set(autorizacao());
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('periodDays', 30);
  });

  // CT-RN06-API-05
  it('CT-RN06-API-05 | Deve retornar cada lançamento com os campos obrigatórios do schema — 200', async () => {
    const res = await request(API_URL).get('/accounts/statement?page=1&limit=5').set(autorizacao());
    expect(res.status).to.equal(200);
    if (res.body.entries.length > 0) {
      const lancamento = res.body.entries[0];
      expect(lancamento).to.have.property('id');
      expect(lancamento).to.have.property('date');
      expect(lancamento).to.have.property('type');
      expect(lancamento).to.have.property('amount');
      expect(lancamento).to.have.property('direction').that.is.oneOf(['credit', 'debit']);
      expect(lancamento).to.have.property('description');
    }
  });

  // CT-RN06-API-06
  it('CT-RN06-API-06 | Deve retornar 401 ao acessar extrato sem token JWT no header', async () => {
    const res = await request(API_URL).get('/accounts/statement');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  // CT-RN06-API-07
  it('CT-RN06-API-07 | Deve retornar 401 ao acessar GET /accounts/me sem token JWT no header', async () => {
    const res = await request(API_URL).get('/accounts/me');
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  // CT-RN06-API-08
  it('CT-RN06-API-08 | Deve retornar dados completos da conta autenticada — GET /accounts/me — 200', async () => {
    const res = await request(API_URL).get('/accounts/me').set(autorizacao());
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('number');
    expect(res.body).to.have.property('digit');
    expect(res.body).to.have.property('balance').that.is.a('number');
    expect(res.body).to.have.property('active', true);
    expect(res.body).to.have.property('owner').that.has.property('name');
  });
});
