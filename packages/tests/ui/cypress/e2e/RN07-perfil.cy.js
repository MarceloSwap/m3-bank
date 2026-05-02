/// <reference types="cypress" />

describe('RN07 - Perfil do Usuario', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('[TC-RN07-001] Perfil - atualiza nome e reflete em tempo real', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Perfil ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.loginPorApi(user.email, user.password);
        cy.visit('/perfil');

        cy.contains('button', 'Alterar Nome').should('have.class', 'button-tab--active');
        cy.contains('label', 'Nome completo').find('input').clear().type(massa.perfil.nomeAtualizado);
        cy.contains('button', 'Atualizar Nome').click();
        cy.contains('Nome atualizado com sucesso', { timeout: 10000 }).should('be.visible');
        cy.contains('button', 'Fechar').click();
        cy.visit('/home');
        cy.contains(massa.perfil.nomeAtualizado).should('be.visible');
      });
    });
  });

  it('[TC-RN07-002] Perfil - valida nome minimo de 2 caracteres', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Perfil Inv ${Date.now()}`, createWithBalance: true }).then((user) => {
        cy.loginPorApi(user.email, user.password);
        cy.visit('/perfil');

        cy.contains('label', 'Nome completo').find('input').clear().type(massa.perfil.nomeInvalido);
        cy.contains('button', 'Atualizar Nome').click();
        cy.contains('Nome deve ter pelo menos 2 caracteres').should('be.visible');
      });
    });
  });

  it('[TC-RN07-003] Perfil - altera senha e bloqueia confirmacao divergente', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.criarUsuarioApi({ name: `QA Perfil Senha ${Date.now()}`, createWithBalance: true, password: massa.senhaPadrao }).then((user) => {
        cy.loginPorApi(user.email, user.password);
        cy.visit('/perfil');
        cy.contains('button', 'Alterar Senha').click();

        cy.get('form').find('input').eq(0).type(massa.senhaPadrao);
        cy.get('form').find('input').eq(1).type(massa.perfil.novaSenha);
        cy.get('form').find('input').eq(2).type(`${massa.perfil.novaSenha}X`);
        cy.get('form button[type="submit"]').click();
        cy.contains('As senhas nao coincidem').should('be.visible');

        cy.get('form').find('input').eq(2).clear().type(massa.perfil.novaSenha);
        cy.get('form button[type="submit"]').click();
        cy.contains('Senha alterada com sucesso', { timeout: 10000 }).should('be.visible');
      });
    });
  });
});
