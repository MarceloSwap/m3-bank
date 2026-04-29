/// <reference types="cypress" />

describe('RN02 - Login e Autenticação', () => {
  const QA_PREFIX = 'qa_';

  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('Deve fazer login com credenciais válidas e armazenar o token JWT', () => {
    cy.fixture('usuarios').then((massa) => {
      const user = massa.login.valido;
      
      const uniqueEmail = `${QA_PREFIX}login_${Date.now()}@m3bank.test`;
      const uniqueCpf = Date.now().toString().slice(-11);

      // URL hardcoded para garantir que o Cypress acerte o seu backend em cheio!
      cy.request({
        method: 'POST',
        url: 'http://localhost:3334/api/auth/register',
        body: {
          name: "QA Utilizador Login",
          email: uniqueEmail,
          cpf: uniqueCpf,
          password: user.senha,
          confirmPassword: user.senha,
          createWithBalance: true
        }
      });

      cy.loginAPIouUI(uniqueEmail, user.senha);

      cy.url({ timeout: 10000 }).should('include', '/home');

      cy.window().then((win) => {
        const auth = win.localStorage.getItem('m3-bank-auth');
        expect(auth).to.exist;
        
        const parsed = JSON.parse(auth);
        expect(parsed).to.have.property('token');
        expect(parsed.token).to.be.a('string');
        expect(parsed.token.split('.')).to.have.length(3);
      });
    });
  });

  it('Deve exibir erro ao tentar acessar com e-mail não cadastrado e fechar o modal', () => {
    cy.fixture('usuarios').then((massa) => {
      const invalido = massa.login.invalido;
      
      cy.loginAPIouUI(invalido.emailNaoCadastrado, massa.login.valido.senha);
      
      cy.contains('Credenciais inválidas').should('be.visible');
      cy.contains('button', 'Fechar').should('be.visible').click();
      cy.contains('Credenciais inválidas').should('not.exist');
    });
  });

  it('Deve exibir erro ao tentar acessar com senha incorreta e fechar o modal', () => {
    cy.fixture('usuarios').then((massa) => {
      const user = massa.login.valido;
      const invalido = massa.login.invalido;
      
      const uniqueEmail = `${QA_PREFIX}erro_${Date.now()}@m3bank.test`;
      const uniqueCpf = Date.now().toString().slice(-11);

      // URL hardcoded aqui também!
      cy.request({
        method: 'POST',
        url: 'http://localhost:3334/api/auth/register',
        body: {
          name: "QA Utilizador Erro",
          email: uniqueEmail,
          cpf: uniqueCpf,
          password: user.senha,
          confirmPassword: user.senha,
          createWithBalance: true
        }
      });

      cy.loginAPIouUI(uniqueEmail, invalido.senhaErrada);

      cy.contains('Credenciais inválidas').should('be.visible');
      cy.contains('button', 'Fechar').should('be.visible').click();
      cy.contains('Credenciais inválidas').should('not.exist');
    });
  });

  it('Deve exigir preenchimento dos campos obrigatórios e fechar o modal', () => {
    cy.loginAPIouUI();
    
    cy.contains('Usuário e senha precisam ser preenchidos').should('be.visible');
    cy.contains('button', 'Fechar').should('be.visible').click();
    cy.contains('Usuário e senha precisam ser preenchidos').should('not.exist');
  });
});