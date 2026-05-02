const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;
const EMAIL   = 'qa_rn05_swagger@test.com';

describe('RN05 - Pagamentos Pix Simulado (API)', () => {
  let db, token;

  before(async () => {
    db = await mysql.createConnection(global.DB_CONFIG);
    await request(API_URL).post('/auth/register').send({
      name: 'QA Pix Swagger', email: EMAIL,
      password: 'Senha@123456', confirmPassword: 'Senha@123456',
      cpf: '60066066066', createWithBalance: true
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

  // CT-RN05-API-01
  it('CT-RN05-API-01 | Deve simular pagamento Pix com sucesso e retornar novo saldo — 201', async () => {
    const res = await request(API_URL).post('/payments/pix/simulate')
      .set(autorizacao()).send({ amount: 25, description: 'Pix simulado QA' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message', 'Pagamento Pix simulado realizado com sucesso');
    expect(res.body).to.have.property('balance').that.is.a('number');
  });

  // CT-RN05-API-02
  it('CT-RN05-API-02 | Deve bloquear pagamento Pix com valor zero — 400', async () => {
    const res = await request(API_URL).post('/payments/pix/simulate')
      .set(autorizacao()).send({ amount: 0 });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Informe um valor válido para o pagamento');
  });

  // CT-RN05-API-03
  it('CT-RN05-API-03 | Deve bloquear pagamento Pix com saldo insuficiente — 400', async () => {
    const res = await request(API_URL).post('/payments/pix/simulate')
      .set(autorizacao()).send({ amount: 999999, description: 'QA saldo insuficiente' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Saldo insuficiente para realizar o pagamento');
  });

  // CT-RN05-API-04
  it('CT-RN05-API-04 | Deve bloquear pagamento Pix com valor em formato de texto — tipagem inválida — 400', async () => {
    const res = await request(API_URL).post('/payments/pix/simulate')
      .set(autorizacao()).send({ amount: 'cem reais' });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message');
  });

  // CT-RN05-API-05
  it('CT-RN05-API-05 | Deve retornar 401 ao simular Pix sem token JWT no header', async () => {
    const res = await request(API_URL).post('/payments/pix/simulate').send({ amount: 10 });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message');
  });
});
