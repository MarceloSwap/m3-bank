const apiUrl = Cypress.env('apiUrl');
const password = 'Senha@123456';

function uniqueCpf() {
  return Date.now().toString().slice(-11).padStart(11, '1');
}

Cypress.Commands.add('loginAPIouUI', (email, senha) => {
  cy.contains('button', 'Entrar').should('be.visible').click();
  if (email) cy.get('form').find('input').eq(0).clear().type(email);
  if (senha) cy.get('form').find('input').eq(1).clear().type(senha);
  cy.contains('button', 'Acessar dashboard').click();
});

Cypress.Commands.add('criarUsuarioApi', (overrides = {}) => {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const payload = {
    name: overrides.name || `QA User ${stamp}`,
    email: overrides.email || `qa_${stamp}@m3bank.test`,
    cpf: overrides.cpf || uniqueCpf(),
    password: overrides.password || password,
    confirmPassword: overrides.confirmPassword || overrides.password || password,
    createWithBalance: overrides.createWithBalance ?? true
  };

  return cy.request('POST', `${apiUrl}/auth/register`, payload).then((registerResponse) => ({
    ...payload,
    registerResponse
  }));
});

Cypress.Commands.add('loginPorApi', (email, senha = password) => {
  return cy.request('POST', `${apiUrl}/auth/login`, { email, password: senha }).then((response) => {
    const session = {
      token: response.body.token,
      user: response.body.user,
      account: response.body.account
    };
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.setItem('m3-bank-auth', JSON.stringify(session));
    });
    cy.wrap(session);
  });
});

Cypress.Commands.add('visitarAutenticado', (path, session) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('m3-bank-auth', JSON.stringify(session));
    }
  });
});

Cypress.Commands.add('entrarComoNovoUsuario', (overrides = {}) => {
  return cy.criarUsuarioApi(overrides).then((user) => {
    cy.loginPorApi(user.email, user.password).then((session) => ({ user, session }));
  });
});
