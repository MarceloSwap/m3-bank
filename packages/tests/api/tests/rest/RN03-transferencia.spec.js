const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL        = global.API_BASE_URL;
const EMAIL_PAGADOR  = 'qa_rn03_pagador@test.com';
const EMAIL_RECEBEDOR = 'qa_rn03_recebedor@test.com';

describe('RN03 - Transferências (API)', () => {
  let db, tokenPagador, contaPagador, contaRecebedor;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);

    const resRecebedor = await request(API_URL).post('/auth/register').send({
      name: 'QA Recebedor RN03', email: EMAIL_RECEBEDOR,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '30033033033', createWithBalance: false
    });
    contaRecebedor = {
      accountNumber: resRecebedor.body.accountNumber,
      accountDigit:  resRecebedor.body.accountDigit
    };

    await request(API_URL).post('/auth/register').send({
      name: 'QA Pagador RN03', email: EMAIL_PAGADOR,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '40044044044', createWithBalance: true
    });

    const resLogin = await request(API_URL).post('/auth/login').send({
      email: EMAIL_PAGADOR, password: 'Senha@123456'
    });
    tokenPagador  = resLogin.body.token;
    contaPagador  = {
      accountNumber: resLogin.body.account.number,
      accountDigit:  resLogin.body.account.digit
    };
  });

  after(async () => {
    if (db) {
      await db.query('SET FOREIGN_KEY_CHECKS = 0');
      await db.query(
        `DELETE contas, usuarios FROM usuarios
         LEFT JOIN contas ON usuarios.id = contas.usuario_id
         WHERE usuarios.email IN (?, ?)`, [EMAIL_PAGADOR, EMAIL_RECEBEDOR]
      );
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
      await db.end();
    }
  });

  const autorizacao = () => ({ Authorization: `Bearer ${tokenPagador}` });

  // CT-RN03-API-01
  it('CT-RN03-API-01 | Deve realizar transferência com sucesso e retornar novo saldo — 201', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({
        accountNumber: contaRecebedor.accountNumber,
        accountDigit:  contaRecebedor.accountDigit,
        amount: 10, description: 'Transferência automatizada QA'
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message', 'Transferência realizada com sucesso');
    expect(res.body).to.have.property('balance').that.is.a('number');
  });

  // CT-RN03-API-02
  it('CT-RN03-API-02 | Deve bloquear transferência com número de conta não numérico — 400', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({ accountNumber: 'abc', accountDigit: '1', amount: 10, description: 'QA' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Conta inválida ou inexistente');
  });

  // CT-RN03-API-03
  it('CT-RN03-API-03 | Deve bloquear transferência sem campo Descrição — 400', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({
        accountNumber: contaRecebedor.accountNumber,
        accountDigit:  contaRecebedor.accountDigit,
        amount: 10
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Descrição é obrigatória');
  });

  // CT-RN03-API-04 — Análise de Valor Limite: R$ 9,99 (inválido)
  it('CT-RN03-API-04 | Deve bloquear transferência com valor abaixo do mínimo — AVL R$ 9,99 — 400', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({
        accountNumber: contaRecebedor.accountNumber,
        accountDigit:  contaRecebedor.accountDigit,
        amount: 9.99, description: 'QA AVL mínimo'
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Valor mínimo para transferência é de R$ 10,00');
  });

  // CT-RN03-API-05 — Saldo inicial R$ 1.000, após CT-01 restam R$ 990. R$ 995 excede o saldo.
  it('CT-RN03-API-05 | Deve bloquear transferência com saldo insuficiente — 400', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({
        accountNumber: contaRecebedor.accountNumber,
        accountDigit:  contaRecebedor.accountDigit,
        amount: 995, description: 'QA saldo insuficiente'
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Saldo insuficiente para realizar a transferência');
  });

  // CT-RN03-API-06
  it('CT-RN03-API-06 | Deve bloquear transferência para a própria conta — anti-fraude — 400', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({
        accountNumber: contaPagador.accountNumber,
        accountDigit:  contaPagador.accountDigit,
        amount: 10, description: 'QA anti-fraude'
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Não é possível transferir para a própria conta');
  });

  // CT-RN03-API-07 — Deposita R$ 6.000 no recebedor para ele ter saldo suficiente para o teste
  it('CT-RN03-API-07 | Deve bloquear transferência acima de R$ 5.000 com token de autorização inválido — 401', async () => {
    await request(API_URL).post('/deposits')
      .set(autorizacao())
      .send({
        accountNumber: contaRecebedor.accountNumber,
        accountDigit:  contaRecebedor.accountDigit,
        amount: 6000, description: 'QA setup token'
      });

    const resLogin = await request(API_URL).post('/auth/login').send({
      email: EMAIL_RECEBEDOR, password: 'Senha@123456'
    });
    const tokenRecebedor = resLogin.body.token;

    const res = await request(API_URL).post('/transfers')
      .set('Authorization', `Bearer ${tokenRecebedor}`)
      .send({
        accountNumber: contaPagador.accountNumber,
        accountDigit:  contaPagador.accountDigit,
        amount: 5000.01, description: 'QA token inválido',
        authorizationToken: '000000'
      });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Token de autorização inválido');
  });

  // CT-RN03-API-08
  it('CT-RN03-API-08 | Deve retornar 401 ao realizar transferência sem token JWT no header', async () => {
    const res = await request(API_URL).post('/transfers')
      .send({
        accountNumber: contaRecebedor.accountNumber,
        accountDigit:  contaRecebedor.accountDigit,
        amount: 10, description: 'QA sem token'
      });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });

  // CT-RN03-API-09
  it('CT-RN03-API-09 | Deve bloquear transferência para conta inexistente — 400/404', async () => {
    const res = await request(API_URL).post('/transfers')
      .set(autorizacao())
      .send({ accountNumber: '000000', accountDigit: '0', amount: 10, description: 'QA conta inexistente' });
    expect(res.status).to.be.oneOf([400, 404]);
    expect(res.body).to.have.property('message');
  });
});
