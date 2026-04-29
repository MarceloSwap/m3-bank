// packages/ui/cypress/support/commands.js

Cypress.Commands.add('loginAPIouUI', (email, senha) => {
  // Garante que a aba "Entrar" está ativa
  cy.contains('button', 'Entrar').should('be.visible').click();
  
  if (email) {
    cy.get('form').find('input').eq(0).clear().type(email);
  }
  if (senha) {
    cy.get('form').find('input').eq(1).clear().type(senha);
  }
  
  cy.contains('button', 'Acessar dashboard').click();
});