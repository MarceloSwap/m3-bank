const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;
const EMAIL   = 'qa_rn04_swagger@test.com';

describe('RN04 - Depósito Bancário (API)', () => {
  let db, token, conta;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);
    await request(API_URL).post('/auth/register').send({
      name: 'QA Deposito Swagger', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '50055055055', createWithBalance: false
    });
    const res = await request(API_URL).post('/auth/login').send({ email: EMAIL, password: 'Senha@123456' });
    token = res.body.token;
    conta = { accountNumber: res.body.account.number, accountDigit: res.body.account.digit };
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

  // CT-RN04-API-01
  it('CT-RN04-API-01 | Deve realizar depósito com sucesso e retornar novo saldo — 201', async () => {
    const res = await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({ accountNumber: conta.accountNumber, accountDigit: conta.accountDigit, amount: 500, description: 'Depósito automatizado QA' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('newBalance').that.is.a('number');
  });

  // CT-RN04-API-02
  it('CT-RN04-API-02 | Deve bloquear depósito com número de conta não numérico — 400', async () => {
    const res = await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({ accountNumber: 'abc', accountDigit: '1', amount: 100, description: 'QA' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Conta inválida ou inexistente');
  });

  // CT-RN04-API-03
  it('CT-RN04-API-03 | Deve bloquear depósito sem campo Descrição — 400', async () => {
    const res = await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({ accountNumber: conta.accountNumber, accountDigit: conta.accountDigit, amount: 100 });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Descrição é obrigatória');
  });

  // CT-RN04-API-04 — Análise de Valor Limite: R$ 9,99 (inválido)
  it('CT-RN04-API-04 | Deve bloquear depósito com valor abaixo do mínimo — AVL R$ 9,99 — 400', async () => {
    const res = await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({ accountNumber: conta.accountNumber, accountDigit: conta.accountDigit, amount: 9.99, description: 'QA AVL mínimo' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Valor mínimo para depósito é de R$ 10,00');
  });

  // CT-RN04-API-05 — Análise de Valor Limite: R$ 10.000,01 (inválido)
  it('CT-RN04-API-05 | Deve bloquear depósito com valor acima do máximo — AVL R$ 10.000,01 — 400', async () => {
    const res = await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({ accountNumber: conta.accountNumber, accountDigit: conta.accountDigit, amount: 10000.01, description: 'QA AVL máximo' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Valor máximo para depósito é de R$ 10.000,00');
  });

  // CT-RN04-API-06
  it('CT-RN04-API-06 | Deve retornar 401 ao realizar depósito sem token JWT no header', async () => {
    const res = await request(API_URL).post('/deposits')
      .send({ accountNumber: conta.accountNumber, accountDigit: conta.accountDigit, amount: 100, description: 'QA sem token' });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  // CT-RN04-API-07
  it('CT-RN04-API-07 | Deve bloquear depósito para conta inexistente — 400/404', async () => {
    const res = await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({ accountNumber: '000000', accountDigit: '0', amount: 100, description: 'QA conta inexistente' });
    expect(res.status).to.be.oneOf([400, 404]);
    expect(res.body).to.have.property('message');
  });
});
