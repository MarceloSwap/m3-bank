const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;
const EMAIL   = 'qa_rn01_swagger@test.com';

describe('RN01 - Cadastro de Contas (API)', () => {
  let db;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);
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

  // CT-RN01-API-01
  it('CT-RN01-API-01 | Deve cadastrar conta com sucesso e retornar saldo inicial de R$ 1.000,00', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA Swagger RN01', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '10011011011', createWithBalance: true
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message', 'Conta criada com sucesso');
    expect(res.body).to.have.property('accountNumber');
    expect(res.body).to.have.property('initialBalance', 1000);
  });

  // CT-RN01-API-02
  it('CT-RN01-API-02 | Deve bloquear cadastro com campo Nome vazio — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: '', email: 'x@x.com', password: 'Senha@123456',
      confirmPassword: 'Senha@123456', cpf: '00000000001', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Nome não pode ser vazio');
  });

  // CT-RN01-API-03
  it('CT-RN01-API-03 | Deve bloquear cadastro com campo E-mail vazio — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA', email: '', password: 'Senha@123456',
      confirmPassword: 'Senha@123456', cpf: '00000000002', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Email não pode ser vazio');
  });

  // CT-RN01-API-04
  it('CT-RN01-API-04 | Deve bloquear cadastro com campo Senha vazio — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA', email: 'qa@x.com', password: '',
      confirmPassword: '', cpf: '00000000003', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Senha não pode ser vazio');
  });

  // CT-RN01-API-05
  it('CT-RN01-API-05 | Deve bloquear cadastro com campo CPF vazio — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA', email: 'qa2@x.com', password: 'Senha@123456',
      confirmPassword: 'Senha@123456', cpf: '', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'CPF é obrigatório');
  });

  // CT-RN01-API-06
  it('CT-RN01-API-06 | Deve bloquear cadastro com formato de e-mail inválido — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA', email: 'nao-e-email', password: 'Senha@123456',
      confirmPassword: 'Senha@123456', cpf: '00000000004', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Formato de e-mail inválido');
  });

  // CT-RN01-API-07 — Análise de Valor Limite: 5 chars (inválido), 6 chars (válido)
  it('CT-RN01-API-07 | Deve bloquear senha com menos de 6 caracteres — AVL limite inferior inválido — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA', email: 'qa3@x.com', password: '12345',
      confirmPassword: '12345', cpf: '00000000005', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Senha deve conter no mínimo 6 caracteres');
  });

  // CT-RN01-API-08
  it('CT-RN01-API-08 | Deve bloquear cadastro quando Senha e Confirmação de Senha são diferentes — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA', email: 'qa4@x.com', password: 'Senha@123456',
      confirmPassword: 'Senha@DIFERENTE', cpf: '00000000006', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'As senhas precisam ser iguais');
  });

  // CT-RN01-API-09
  it('CT-RN01-API-09 | Deve bloquear cadastro com e-mail já existente — 400', async () => {
    const res = await request(API_URL).post('/auth/register').send({
      name: 'QA Duplicado', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '99999999999', createWithBalance: false
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'E-mail já cadastrado');
  });
});
