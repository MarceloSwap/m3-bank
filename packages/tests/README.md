# 🧪 M3 Bank - Test Infrastructure

Framework de testes automatizado com suporte a Testes Exploratórios (SBTM).

**Estratégia:** Confiança Máxima com Mínimo Esforço (Kent Beck)  
**Isolamento:** Limpeza Cirúrgica (prefixo `qa_` + domínio `@test.com`)  
**Arquitetura:** Domain-Driven (API e UI isolados por diretórios)

---

## 📦 Estrutura

packages/tests/
├── api/                              # Testes de API Backend
│   ├── config/baseConfig.js          # Configuração de URLs e DB
│   ├── scripts/cleanup-tests.js      # Script de limpeza cirúrgica
│   ├── fixtures/                     # Payloads JSON de teste
│   ├── tests/                        # Arquivos RNXX-funcionalidade.spec.js
│   └── docs/                         # GESTAO-DADOS-TESTE.md e CHARTER-API-VADER.md
│
├── ui/                               # Testes de UI Frontend
│   ├── cypress.config.js             # Configuração técnica do Cypress
│   ├── e2e/                          # Fluxos End-to-End
│   ├── fixtures/                     # Dados para interceptação de UI
│   ├── support/                      # Custom commands (cy.login, etc)
│   └── docs/                         # CHARTER-UI-BOUNDARY.md
│
├── package.json                      # Scripts de execução e dependências
├── BACKLOG.md                        # Cards formatados para o projeto
└── README.md                         # Este guia de infraestrutura

---

## 🚀 Instalação e Uso

### **Pré-requisitos**
- Node.js 18+ e MySQL 8+.
- API rodando em `http://localhost:3334` e Web em `http://localhost:3000`.

### **Scripts Disponíveis**

# Executar testes de API (Backend)
npm run test:api

# Abrir Cypress interativo (UI)
npm run test:e2e:open

# Executar todos os testes em sequência
npm run test:all

# Limpar dados de teste (Idempotência)
npm run cleanup-qa

---

## 🧩 Padrões de Teste

### **Exemplo de Teste de API (api/tests/)**
```javascript
const request = require('supertest');
const { expect } = require('chai');
const API_URL = 'http://localhost:3334/api';

describe('RN01 - Login (API)', () => {
  it('Deve retornar token JWT com credenciais válidas', async () => {
    const response = await request(API_URL).post('/auth/login').send({
      email: 'qa_usuario@test.com',
      password: 'Senha@123456'
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
  });
});