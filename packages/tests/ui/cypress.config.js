const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // URL da interface Web
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Configurações de estabilidade para evitar falhas por lentidão local
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Garante que o estado (cookies/storage) seja limpo entre cada it()
    testIsolation: true,

    // Variáveis de ambiente para uso nos testes
    env: {
      apiUrl: 'http://localhost:3334/api', // URL do Backend para comandos de setup/cleanup
    },

    setupNodeEvents(on, config) {
      // Local para implementar tasks customizadas de banco de dados
      // on('task', {
      //   'db:reset': () => { ... }
      // });
      return config;
    },
    
    // Define o padrão de arquivos de teste para a nova convenção
    specPattern: 'cypress/e2e/**/*.cy.js'
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    }
  }
});