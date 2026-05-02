/// <reference types="cypress" />

describe('RN06 - Extrato e Saldo', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('[TC-RN06-001] Extrato - exibe saldo, paginacao e filtros de periodo', () => {
    cy.criarUsuarioApi({ name: `QA Extrato ${Date.now()}`, createWithBalance: true }).then((user) => {
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email: user.email, password: user.password }).then((response) => {
        cy.visitarAutenticado('/home', {
          token: response.body.token,
          user: response.body.user,
          account: response.body.account
        });
      });
      cy.contains('Saldo disponivel atualizado', { timeout: 10000 }).should('be.visible');
      cy.window().then((win) => {
        const session = JSON.parse(win.localStorage.getItem('m3-bank-auth'));
        cy.visitarAutenticado('/extrato', session);
      });

        cy.contains('Saldo disponivel').should('be.visible');
      cy.contains(/Pagina 1 de/).should('be.visible');
      cy.contains('button', 'Ultimos 7 dias').click().should('have.class', 'filter-button--active');
      cy.contains('button', 'Ultimos 15 dias').click().should('have.class', 'filter-button--active');
      cy.contains('button', 'Ultimos 30 dias').click().should('have.class', 'filter-button--active');
    });
  });

  it('[TC-RN06-002] Home - exibe movimentacoes recentes com descricao', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Home Mov ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email: user.email, password: user.password }).then((response) => {
          cy.visitarAutenticado('/pagamentos', {
            token: response.body.token,
            user: response.body.user,
            account: response.body.account
          });
        });
        cy.contains('label', 'Valor do pagamento').find('input').type(massa.pix.valorSucesso);
        cy.contains('label', 'Descricao').find('input').clear().type('Movimentacao Home Cypress');
        cy.contains('button', 'Simular Leitura').click();
        cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
        cy.contains('button', 'Voltar para Home').click();

        cy.contains('Movimentacao Home Cypress', { timeout: 10000 }).should('be.visible');
      });
    });
  });
});
