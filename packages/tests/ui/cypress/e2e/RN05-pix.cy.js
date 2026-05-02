/// <reference types="cypress" />

describe('RN05 - Pagamentos Pix Simulado', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('[TC-RN05-001] Pix - exibe QR Code estatico e simula pagamento', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Pix ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email: user.email, password: user.password }).then((response) => {
          cy.visitarAutenticado('/pagamentos', {
            token: response.body.token,
            user: response.body.user,
            account: response.body.account
          });
        });

        cy.get('svg[aria-label*="QR Code"]').should('be.visible');
        cy.contains('label', 'Valor do pagamento').find('input').type(massa.pix.valorSucesso);
        cy.contains('label', 'Descricao').find('input').clear().type(massa.pix.descricao);
        cy.contains('button', 'Simular Leitura').click();

        cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
        cy.contains(/Pix|Pagamento/).should('be.visible');
      });
    });
  });

  it('[TC-RN05-002] Pix - registra saida no extrato', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Pix Extrato ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email: user.email, password: user.password }).then((response) => {
          cy.visitarAutenticado('/pagamentos', {
            token: response.body.token,
            user: response.body.user,
            account: response.body.account
          });
        });
        cy.contains('label', 'Valor do pagamento').find('input').type(massa.pix.valorSucesso);
        cy.contains('label', 'Descricao').find('input').clear().type(massa.pix.descricao);
        cy.contains('button', 'Simular Leitura').click();
        cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
        cy.contains('button', 'Voltar para Home').click();
        cy.contains('Saldo disponivel atualizado', { timeout: 10000 }).should('be.visible');
        cy.window().then((win) => {
          const session = JSON.parse(win.localStorage.getItem('m3-bank-auth'));
          cy.visitarAutenticado('/extrato', session);
        });

        cy.contains(massa.pix.descricao, { timeout: 10000 }).should('be.visible');
        cy.contains('(-)').should('be.visible');
      });
    });
  });
});
