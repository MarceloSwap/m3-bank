/// <reference types="cypress" />

describe('RN02 - Login e Autenticacao', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('[TC-RN02-001] Login - autentica credenciais validas e armazena JWT', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ createWithBalance: true, password: massa.senhaPadrao }).then((user) => {
        cy.loginAPIouUI(user.email, user.password);
        cy.url({ timeout: 10000 }).should('include', '/home');
        cy.window().then((win) => {
          const parsed = JSON.parse(win.localStorage.getItem('m3-bank-auth'));
          expect(parsed.token.split('.')).to.have.length(3);
        });
      });
    });
  });

  it('[TC-RN02-002] Login - rejeita e-mail nao cadastrado', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.loginAPIouUI(massa.login.invalido.emailNaoCadastrado, massa.senhaPadrao);
      cy.contains(/Credenciais invalidas|Credenciais inválidas/).should('be.visible');
      cy.contains('button', 'Fechar').click();
    });
  });

  it('[TC-RN02-003] Login - rejeita senha incorreta', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ createWithBalance: true, password: massa.senhaPadrao }).then((user) => {
        cy.loginAPIouUI(user.email, massa.login.invalido.senhaErrada);
        cy.contains(/Credenciais invalidas|Credenciais inválidas/).should('be.visible');
      });
    });
  });

  it('[TC-RN02-004] Login - exige campos obrigatorios', () => {
    cy.loginAPIouUI();
    cy.contains(/Usuario e senha precisam ser preenchidos|Usuário e senha precisam ser preenchidos/).should('be.visible');
  });
});
