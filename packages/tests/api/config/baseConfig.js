/**
 * Base Configuration for M3 Bank Test Suite
 * Supports both local development and CI environments
 */

const path = require('path');
const dotenv = require('dotenv');

// 1. CARREGAR DOTENV PRIMEIRO (Subindo 4 níveis para chegar na raiz do projeto)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// 2. DEFINIR CONSTANTES APÓS O CARREGAMENTO
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3334;
const WEB_HOST = process.env.WEB_HOST || 'localhost';
const WEB_PORT = process.env.WEB_PORT || 3000;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || ''; // Agora pegará do .env
const DB_NAME = process.env.DB_NAME || 'm3_bank';

// Base URLs for API and Frontend
global.API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
global.API_GRAPHQL_URL = `http://${API_HOST}:${API_PORT}/graphql`;
global.WEB_BASE_URL = `http://${WEB_HOST}:${WEB_PORT}`;
global.API_HEALTH_URL = `http://${API_HOST}:${API_PORT}/health`;

// Database Configuration
global.DB_CONFIG = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

// Test Data Prefixes e Templates
global.QA_PREFIX = 'qa_';
global.TEST_DOMAIN = '@test.com';
global.TEST_USER_TEMPLATE = {
  name: `${global.QA_PREFIX}usuario`,
  email: `${global.QA_PREFIX}usuario@test.com`,
  password: 'Senha@123456',
  createAccountWithBalance: true
};

// Timeouts e Logs
global.SHORT_TIMEOUT = 5000;
global.MEDIUM_TIMEOUT = 10000;
global.LONG_TIMEOUT = 30000;

if (process.env.DEBUG || !process.env.DB_PASSWORD) {
  console.log('=== M3 Bank Test Configuration ===');
  console.log(`API Base URL: ${global.API_BASE_URL}`);
  if (!process.env.DB_PASSWORD) {
    console.warn('⚠️  Atenção: DB_PASSWORD não detectado no .env!');
  } else {
    console.log('✅ Variáveis de ambiente carregadas com sucesso.');
  }
  console.log('===================================\n');
}

module.exports = {
  API_BASE_URL: global.API_BASE_URL,
  API_GRAPHQL_URL: global.API_GRAPHQL_URL,
  WEB_BASE_URL: global.WEB_BASE_URL,
  API_HEALTH_URL: global.API_HEALTH_URL,
  DB_CONFIG: global.DB_CONFIG,
  QA_PREFIX: global.QA_PREFIX,
  TEST_DOMAIN: global.TEST_DOMAIN,
  TEST_USER_TEMPLATE: global.TEST_USER_TEMPLATE,
  SHORT_TIMEOUT: global.SHORT_TIMEOUT,
  MEDIUM_TIMEOUT: global.MEDIUM_TIMEOUT,
  LONG_TIMEOUT: global.LONG_TIMEOUT
};