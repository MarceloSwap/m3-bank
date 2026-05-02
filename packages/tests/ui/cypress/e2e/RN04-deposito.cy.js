/// <reference types="cypress" />

describe('RN04 - Deposito Bancario', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  function abrirDeposito() {
    return cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Deposito ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.loginPorApi(user.email, user.password).then((session) => {
          cy.visit('/deposito');
          cy.wrap({ massa, user, session });
        });
      });
    });
  }

  it('[TC-RN04-001] Deposito - realiza deposito com sucesso', () => {
    abrirDeposito().then(({ massa, session }) => {
      cy.contains('label', 'Numero da conta').find('input').type(session.account.number);
      cy.contains('label', 'Digito').find('input').type(session.account.digit);
      cy.contains('label', 'Valor (R$)').find('input').type(massa.deposito.limiteInferiorValido);
      cy.contains('label', 'Descricao').find('input').type('Deposito limite valido');
      cy.contains('button', 'Confirmar Deposito').click();

      cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
      cy.contains(/Depósito realizado com sucesso|Deposito realizado com sucesso|Depósito/).should('be.visible');
    });
  });

  it('[TC-RN04-002] Deposito - valida limites R$ 9,99, R$ 10,00 e R$ 10.000,01', () => {
    abrirDeposito().then(({ massa, session }) => {
      cy.contains('label', 'Numero da conta').find('input').type(session.account.number);
      cy.contains('label', 'Digito').find('input').type(session.account.digit);
      cy.contains('label', 'Descricao').find('input').type('Analise valor limite');

      cy.contains('label', 'Valor (R$)').find('input').clear().type(massa.deposito.limiteInferiorInvalido);
      cy.contains('button', 'Confirmar Deposito').click();
      cy.contains(/Valor minimo para deposito|Valor mínimo para depósito/).should('be.visible');

      cy.contains('label', 'Valor (R$)').find('input').clear().type(massa.deposito.limiteSuperiorInvalido);
      cy.contains('button', 'Confirmar Deposito').click();
      cy.contains(/Valor maximo para deposito|Valor máximo para depósito/).should('be.visible');

      cy.contains('label', 'Valor (R$)').find('input').clear().type(massa.deposito.limiteInferiorValido);
      cy.contains('button', 'Confirmar Deposito').click();
      cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
    });
  });

  it('[TC-RN04-003] Deposito - seleciona conta pela lista', () => {
    abrirDeposito().then(({ user }) => {
      cy.contains('button', /Mostrar contas disponiveis|Mostrar contas disponíveis/).click();
      cy.contains('button', user.name).should('be.visible').click();
      cy.contains('label', 'Numero da conta').find('input').should('not.have.value', '');
      cy.contains('label', 'Digito').find('input').should('not.have.value', '');
    });
  });
});
