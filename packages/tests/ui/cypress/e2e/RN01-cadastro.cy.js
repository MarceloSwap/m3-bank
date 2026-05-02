/// <reference types="cypress" />

describe('RN01 - Cadastro de Contas', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('button', 'Cadastrar').click();
  });

  it('[TC-RN01-001] Cadastro - cria conta com sucesso', () => {
    cy.fixture('usuarios').then((massa) => {
      const email = `qa_cadastro_${Date.now()}@m3bank.test`;
      const cpf = Date.now().toString().slice(-11).padStart(11, '1');

      cy.contains('label', 'Nome').find('input').type(massa.cadastroValido.nome);
      cy.contains('label', 'E-mail').find('input').type(email);
      cy.contains('label', 'CPF').find('input').type(cpf);
      cy.contains('label', 'Senha').find('input').type(massa.cadastroValido.senha);
      cy.contains('label', 'Confirmar senha').find('input').type(massa.cadastroValido.senha);
      cy.contains('button', 'Criar conta').click();

      cy.contains('Conta criada com sucesso', { timeout: 10000 }).should('be.visible');
      cy.contains('button', 'Entrar').should('be.visible');
    });
  });

  it('[TC-RN01-002] Cadastro - bloqueia senhas divergentes', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.contains('label', 'Nome').find('input').type(massa.cadastroValido.nome);
      cy.contains('label', 'E-mail').find('input').type(`qa_div_${Date.now()}@m3bank.test`);
      cy.contains('label', 'CPF').find('input').type(Date.now().toString().slice(-11).padStart(11, '1'));
      cy.contains('label', 'Senha').find('input').type(massa.cadastroValido.senha);
      cy.contains('label', 'Confirmar senha').find('input').type(`${massa.cadastroValido.senha}X`);
      cy.contains('button', 'Criar conta').click();

      cy.contains('As senhas nao coincidem').should('be.visible');
    });
  });

  it('[TC-RN01-003] Cadastro - valida senha curta por valor limite', () => {
    cy.fixture('usuarios').then((massa) => {
      cy.contains('label', 'Senha').find('input').type(massa.cadastroInvalido.senhaCurta);
      cy.contains('label', 'Confirmar senha').find('input').type(massa.cadastroInvalido.senhaCurta);
      cy.contains('button', 'Criar conta').click();

      cy.contains('Senha deve conter no minimo 6 caracteres').should('be.visible');
    });
  });

  it('[TC-RN01-004] Cadastro - exige campos obrigatorios', () => {
    cy.contains('button', 'Criar conta').click();

    cy.contains('Nome nao pode ser vazio').should('be.visible');
    cy.contains('Email nao pode ser vazio').should('be.visible');
    cy.contains('CPF nao pode ser vazio').should('be.visible');
    cy.contains('Senha nao pode ser vazio').should('be.visible');
  });
});
