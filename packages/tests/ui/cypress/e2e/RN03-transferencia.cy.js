/// <reference types="cypress" />

describe('RN03 - Transferencias', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  function prepararTransferencia() {
    return cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Recebedor ${Date.now()}`, createWithBalance: false }).then((recebedor) => {
        cy.loginPorApi(recebedor.email, recebedor.password).then((sessaoRecebedor) => {
          cy.criarUsuarioApi({ name: `QA Pagador ${Date.now()}`, createWithBalance: true }).then((pagador) => {
            cy.loginPorApi(pagador.email, pagador.password);
            cy.visit('/transferencia');
            cy.wrap({ massa, recebedor, sessaoRecebedor, pagador });
          });
        });
      });
    });
  }

  it('[TC-RN03-001] Transferencias - realiza transferencia manual com sucesso', () => {
    prepararTransferencia().then(({ massa, sessaoRecebedor }) => {
      cy.contains('label', 'Numero da conta').find('input').type(sessaoRecebedor.account.number);
      cy.contains('label', 'Digito').find('input').type(sessaoRecebedor.account.digit);
      cy.contains('label', 'Valor').find('input').type(massa.transferencia.valorSucesso);
      cy.contains('label', 'Descricao').find('input').type('Transferencia Cypress');
      cy.contains('button', 'Transferir agora').click();

      cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
      cy.contains(/Transferência realizada com sucesso|Transferencia realizada com sucesso/).should('be.visible');
    });
  });

  it('[TC-RN03-002] Transferencias - aplica valor limite R$ 9,99 e R$ 10,00', () => {
    prepararTransferencia().then(({ massa, sessaoRecebedor }) => {
      cy.contains('label', 'Numero da conta').find('input').type(sessaoRecebedor.account.number);
      cy.contains('label', 'Digito').find('input').type(sessaoRecebedor.account.digit);
      cy.contains('label', 'Descricao').find('input').type('Valor limite');

      cy.contains('label', 'Valor').find('input').clear().type(massa.transferencia.limiteInferiorInvalido);
      cy.contains('button', 'Transferir agora').click();
      cy.contains(/Valor minimo para transferencia|Valor mínimo para transferência/).should('be.visible');

      cy.contains('label', 'Valor').find('input').clear().type(massa.transferencia.limiteInferiorValido);
      cy.contains('button', 'Transferir agora').click();
      cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
    });
  });

  it('[TC-RN03-003] Transferencias - seleciona conta na lista e preenche destino', () => {
    prepararTransferencia().then(({ recebedor }) => {
      cy.contains('button', /Mostrar contas disponiveis|Mostrar contas disponíveis/).click();
      cy.contains('button', recebedor.name).should('be.visible').click();
      cy.contains('label', 'Numero da conta').find('input').should('not.have.value', '');
      cy.contains('label', 'Digito').find('input').should('not.have.value', '');
    });
  });

  it('[TC-RN03-004] Transferencias - exige token para valor acima de R$ 5.000,00', () => {
    prepararTransferencia().then(({ massa, sessaoRecebedor }) => {
      cy.contains('label', 'Numero da conta').find('input').type(sessaoRecebedor.account.number);
      cy.contains('label', 'Digito').find('input').type(sessaoRecebedor.account.digit);
      cy.contains('label', 'Valor').find('input').type(massa.transferencia.valorAlto);
      cy.contains('label', 'Descricao').find('input').type('Transferencia alta');
      cy.contains('button', 'Transferir agora').click();
      cy.get('.modal__dialog', { timeout: 15000 }).should('be.visible');
      cy.contains(/token|autoriz/i).should('be.visible');
    });
  });

  it('[TC-RN03-005] Transferencias - bloqueia valor acima do limite noturno (R$ 1.000,00 entre 20h-05h59)', () => {
    // Simula horário noturno: 22h00 no fuso local
    const horarioNoturno = new Date();
    horarioNoturno.setHours(22, 0, 0, 0);

    cy.clock(horarioNoturno.getTime());

    prepararTransferencia().then(({ sessaoRecebedor }) => {
      cy.contains('label', 'Numero da conta').find('input').type(sessaoRecebedor.account.number);
      cy.contains('label', 'Digito').find('input').type(sessaoRecebedor.account.digit);
      // R$ 1.000,01 — acima do teto noturno
      cy.contains('label', 'Valor').find('input').type('1000.01');
      cy.contains('label', 'Descricao').find('input').type('Teste limite noturno');
      cy.contains('button', 'Transferir agora').click();

      cy.contains(/limite noturno|Valor excede o limite noturno/i, { timeout: 10000 }).should('be.visible');
    });
  });

  it('[TC-RN03-006] Transferencias - bloqueia transferencia para a propria conta — anti-fraude', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Antifraude ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.loginPorApi(user.email, user.password).then((session) => {
          cy.visit('/transferencia');
          cy.contains('label', 'Numero da conta').find('input').type(session.account.number);
          cy.contains('label', 'Digito').find('input').type(session.account.digit);
          cy.contains('label', 'Valor').find('input').type(massa.transferencia.valorSucesso);
          cy.contains('label', 'Descricao').find('input').type('Anti-fraude propria conta');
          cy.contains('button', 'Transferir agora').click();

          cy.contains(/própria conta|propria conta|Não é possível transferir/i, { timeout: 10000 }).should('be.visible');
        });
      });
    });
  });
});
