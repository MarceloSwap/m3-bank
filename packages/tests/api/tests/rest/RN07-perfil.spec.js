const request = require('supertest');
const { expect } = require('chai');
const mysql = require('mysql2/promise');

const API_URL = global.API_BASE_URL;

describe('RN07 - Perfil do Usuário (API)', () => {
  let dbConnection;
  let userToken;
  const emailUser = 'qa_api_perfil@test.com';

  before(async () => {
    dbConnection = await mysql.createConnection(global.DB_CONFIG);
    
    await request(API_URL).post('/auth/register').send({
      name: 'QA Perfil Original', email: emailUser, password: 'Senha@123456', confirmPassword: 'Senha@123456', cpf: '11199922288', createWithBalance: false
    });
    
    const resLogin = await request(API_URL).post('/auth/login').send({ email: emailUser, password: 'Senha@123456' });
    userToken = resLogin.body.token;
  });

 it('Deve retornar os dados da conta autenticada (GET)', async () => {
    const response = await request(API_URL)
      .get('/accounts/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('owner');
    expect(response.body.owner).to.have.property('name', 'QA Perfil Original');
  });

  it('Deve atualizar o nome do perfil do usuário com sucesso (PUT)', async () => {
    const response = await request(API_URL)
      .put('/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'QA Perfil Atualizado'
      });

    expect(response.status).to.equal(200);
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