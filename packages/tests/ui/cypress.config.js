const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Implementar task customizada se necessário
      // on('task', {
      //   'cleanup-qa': () => { ... }
      // });
      return config;
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    }
  }
});
