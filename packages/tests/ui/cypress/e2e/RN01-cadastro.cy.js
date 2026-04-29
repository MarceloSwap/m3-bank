/// <reference types="cypress" />

describe('RN01 - Cadastro de Contas', () => {
  const QA_PREFIX = 'qa_';

  beforeEach(() => {
    cy.visit('/'); 
    cy.clearLocalStorage();
    cy.contains('button', 'Cadastrar').should('be.visible').click();
  });

  it('Deve cadastrar um usuário com sucesso (Happy Path)', () => {
    cy.fixture('usuarios').then((massa) => {
      const user = massa.cadastroValido;
      const uniqueEmail = `${QA_PREFIX}user_${Date.now()}@m3bank.test`;
      
      // Gera um CPF único de 11 dígitos para evitar conflito no MySQL!
      const uniqueCpf = Date.now().toString().slice(-11);

      cy.get('form').find('input').eq(0).type(user.nome); 
      cy.get('form').find('input').eq(1).type(uniqueEmail);   
      cy.get('form').find('input').eq(2).type(uniqueCpf);  // Usa o CPF dinâmico aqui
      cy.get('form').find('input').eq(3).type(user.senha); 
      cy.get('form').find('input').eq(4).type(user.senha); 

      cy.contains('button', 'Criar conta').click();

      cy.contains('Conta criada com sucesso', { timeout: 10000 }).should('be.visible');
      cy.contains('button', 'Entrar').should('be.visible');
    });
  });

  it('Deve exibir erro ao tentar cadastrar senhas diferentes', () => {
    cy.fixture('usuarios').then((massa) => {
      const user = massa.cadastroValido;
      const uniqueCpf = Date.now().toString().slice(-11);

      cy.get('form').find('input').eq(0).type(user.nome);
      cy.get('form').find('input').eq(1).type(`${QA_PREFIX}erro@m3bank.test`);
      cy.get('form').find('input').eq(2).type(uniqueCpf);
      
      // Digitamos a senha certa no primeiro campo
      cy.get('form').find('input').eq(3).type(user.senha);
      
      // No segundo, concatenamos "ERRADA" para garantir 100% que será diferente
      // O .blur() força o React a atualizar o estado antes do clique
      cy.get('form').find('input').eq(4).type(user.senha + 'ERRADA').blur(); 

      cy.contains('button', 'Criar conta').click();

      // Agora a validação é obrigada a aparecer
      cy.contains('As senhas não coincidem').should('be.visible');
    });
  });

  it('Deve validar tamanho mínimo de 6 caracteres na senha (Boundary Value)', () => {
    cy.fixture('usuarios').then((massa) => {
      const invalido = massa.cadastroInvalido;

      cy.get('form').find('input').eq(3).type(invalido.senhaCurta); 
      cy.get('form').find('input').eq(4).type(invalido.senhaCurta);
      
      cy.contains('button', 'Criar conta').click();

      cy.contains('Senha deve conter no mínimo 6 caracteres').should('be.visible');
    });
  });

  it('Deve exigir preenchimento de campos obrigatórios', () => {
    cy.contains('button', 'Criar conta').click();

    cy.contains('Nome não pode ser vazio').should('be.visible');
    cy.contains('Email não pode ser vazio').should('be.visible');
    cy.contains('CPF não pode ser vazio').should('be.visible');
    cy.contains('Senha não pode ser vazio').should('be.visible');
  });
});