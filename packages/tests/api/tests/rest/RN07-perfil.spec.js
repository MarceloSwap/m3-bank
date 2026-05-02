const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;
const EMAIL   = 'qa_rn07_swagger@test.com';

describe('RN07 - Perfil do Usuário (API)', () => {
  let db, token;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);
    await request(API_URL).post('/auth/register').send({
      name: 'QA Perfil Swagger', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '80088088088', createWithBalance: false
    });
    const res = await request(API_URL).post('/auth/login').send({ email: EMAIL, password: 'Senha@123456' });
    token = res.body.token;
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

  // CT-RN07-API-01
  it('CT-RN07-API-01 | Deve retornar dados completos da conta autenticada — GET /accounts/me — 200', async () => {
    const res = await request(API_URL).get('/accounts/me').set(autorizacao());
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('owner').that.has.property('name', 'QA Perfil Swagger');
  });

  // CT-RN07-API-02
  it('CT-RN07-API-02 | Deve atualizar nome do perfil com sucesso — 200', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ name: 'QA Perfil Atualizado' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Perfil atualizado com sucesso');
  });

  // CT-RN07-API-03
  it('CT-RN07-API-03 | Deve alterar senha com sucesso — 200', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ currentPassword: 'Senha@123456', newPassword: 'NovaSenha@789' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Perfil atualizado com sucesso');
  });

  // CT-RN07-API-04
  it('CT-RN07-API-04 | Deve bloquear atualização com campo Nome vazio — 400', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ name: '' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Nome não pode ser vazio');
  });

  // CT-RN07-API-05 — Análise de Valor Limite: 1 char (inválido)
  it('CT-RN07-API-05 | Deve bloquear atualização com Nome abaixo do mínimo — AVL 1 caractere — 400', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ name: 'A' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Nome deve ter pelo menos 2 caracteres');
  });

  // CT-RN07-API-06
  it('CT-RN07-API-06 | Deve bloquear alteração de senha com senha atual incorreta — 400', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ currentPassword: 'SenhaErrada999', newPassword: 'NovaSenha@000' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Senha atual incorreta');
  });

  // CT-RN07-API-07 — Análise de Valor Limite: nova senha com 3 chars (inválido)
  it('CT-RN07-API-07 | Deve bloquear nova senha com menos de 6 caracteres — AVL limite inferior — 400', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ currentPassword: 'NovaSenha@789', newPassword: '123' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Nova senha deve ter pelo menos 6 caracteres');
  });

  // CT-RN07-API-08
  it('CT-RN07-API-08 | Deve bloquear alteração de senha sem informar senha atual — 400', async () => {
    const res = await request(API_URL).put('/auth/profile')
      .set(autorizacao()).send({ newPassword: 'NovaSenha@000' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Senha atual é obrigatória');
  });

  // CT-RN07-API-09
  it('CT-RN07-API-09 | Deve retornar 401 ao acessar perfil sem token JWT no header', async () => {
    const res = await request(API_URL).put('/auth/profile').send({ name: 'Teste' });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });
});
