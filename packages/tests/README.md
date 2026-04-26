# 🧪 M3 Bank - Test Infrastructure

Framework de testes automatizado com suporte a Testes Exploratórios (SBTM).

**Ramo:** docs/planejamento-e-charters  
**Estratégia:** Confiança Máxima com Mínimo Esforço (Kent Beck)  
**Isolamento:** Limpeza Cirúrgica (prefixo `qa_` + domínio `@test.com`)

---

## 📦 Estrutura

```
packages/tests/
├── config/
│   └── baseConfig.js                 # Configuração de URLs e banco de dados
├── cypress/
│   ├── e2e/                          # Testes end-to-end (E2E)
│   │   ├── RN01-login-sucesso.spec.js
│   │   ├── RN02-cadastro-com-saldo.spec.js
│   │   ├── RN03-transferencia-diurna.spec.js
│   │   ├── RN04-deposito-sucesso.spec.js
│   │   ├── RN05-pagamento-pix.spec.js
│   │   └── RN06-extrato-visualizacao.spec.js
│   ├── fixtures/                     # Dados de teste
│   │   └── test-accounts.json
│   └── support/                      # Helpers e custom commands
│       ├── commands.js               # cy.login(), cy.transfer(), etc
│       └── e2e.js                    # Configuração global
├── supertest/
│   ├── RN01-login.spec.js           # Testes de API
│   ├── RN02-cadastro.spec.js
│   ├── RN03-transferencia.spec.js
│   ├── RN04-deposito.spec.js
│   ├── RN05-pagamento.spec.js
│   └── RN06-extrato.spec.js
├── scripts/
│   └── cleanup-tests.js             # Limpeza cirúrgica de dados QA
├── docs/
│   └── GESTAO-DADOS-TESTE.md        # Wiki: Estratégia de dados
├── cypress.config.js                 # Configuração Cypress
├── package.json                      # Dependências e scripts
├── BACKLOG.md                        # Cards de teste para GitHub Projects
└── README.md                          # Este arquivo
```

---

## 🚀 Instalação

### **Pré-requisitos**

- Node.js 18+
- npm 9+
- MySQL 8+ (rodando em localhost:3306)
- M3 Bank API rodando em http://localhost:3333
- M3 Bank Web rodando em http://localhost:3000

### **Passo 1: Instalar Dependências**

```bash
cd packages/tests
npm install
```

### **Passo 2: Configurar Variáveis de Ambiente (Opcional)**

Crie um arquivo `.env` na raiz do projeto (c:\projetos\m3-bank):

```env
# API
PORT=3333
API_HOST=localhost
API_PORT=3333

# Web
WEB_HOST=localhost
WEB_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=m3_bank
JWT_SECRET=m3-bank-secret
APP_TIMEZONE=America/Sao_Paulo
```

### **Passo 3: Verificar Banco de Dados**

```sql
-- No seu MySQL client
CREATE DATABASE IF NOT EXISTS m3_bank;
```

---

## 📋 Scripts Disponíveis

### **Testes de API (Supertest + Mocha)**

```bash
# Executar todos os testes de API
npm run test:api

# Gera relatório HTML em reports/api/api-report.html
```

### **Testes E2E (Cypress)**

```bash
# Abrir Cypress Test Runner (interactive)
npm run test:e2e:open

# Executar testes em headless mode (CI)
npm run test:e2e
```

### **Todos os Testes**

```bash
# Executa API e E2E em sequência
npm run test:all
```

### **Limpeza de Dados QA**

```bash
# Remove APENAS usuários/contas com prefixo qa_ ou domínio @test.com
npm run cleanup-qa

# Saída:
# 🧹 Iniciando limpeza cirúrgica...
# 📋 Encontrados 5 usuários de teste
# 🗑️ Deletando transações...
# ✅ Limpeza concluída!
```

### **Seed do Banco (Opcional)**

```bash
# Recriar estrutura do banco (cuidado: apaga tudo!)
npm run seed-db
```

---

## 🧪 Executar Testes Localmente

### **Fluxo Típico de Desenvolvimento**

```bash
# 1. Abrir terminal na raiz do projeto
cd c:\projetos\m3-bank

# 2. Iniciar API (terminal 1)
npm run dev:api
# Deve exibir: "M3 Bank API disponível em http://localhost:3333"

# 3. Iniciar Web (terminal 2)
npm run dev:web
# Deve exibir: "ready - started server on 0.0.0.0:3000"

# 4. Em outro terminal, navegar para testes (terminal 3)
cd packages/tests

# 5. Limpar dados anteriores
npm run cleanup-qa

# 6. Executar testes
npm run test:api        # Testa API primeiro
npm run test:e2e:open   # Abre Cypress para E2E interativo

# 7. Após testes, limpar novamente
npm run cleanup-qa
```

---

## 📊 Cobertura de Testes

### **Fluxos Críticos (Priority 1)**

| Card | Funcionalidade | Tipo | Status |
|------|---|---|---|
| 1.1 | Cadastro com Saldo | E2E + API | ⬜ TODO |
| 1.2 | Login | E2E + API | ⬜ TODO |
| 1.3 | Transferência Diurna | E2E + API | ⬜ TODO |
| 1.4 | Extrato Completo | E2E | ⬜ TODO |

### **Fluxos Secundários (Priority 2)**

| Card | Funcionalidade | Tipo | Status |
|------|---|---|---|
| 2.1 | Depósito | E2E + API | ⬜ TODO |
| 2.2 | Extrato (Depósito) | E2E | ⬜ TODO |
| 3.1 | Pagamento PIX | E2E + API | ⬜ TODO |
| 3.2 | Extrato (PIX) | E2E | ⬜ TODO |

### **Testes Exploratórios (Priority 2)**

| Charter | Foco | Tipo | Status |
|---|---|---|---|
| 4.1 | Riscos de API (VADER) | SBTM | ⬜ TODO |
| 4.2 | Riscos de UI (Boundary) | SBTM | ⬜ TODO |

---

## 🔧 Configuração de Ambiente

### **baseConfig.js**

Define URLs e credenciais globais:

```javascript
global.API_BASE_URL = 'http://localhost:3333/api';
global.WEB_BASE_URL = 'http://localhost:3000';
global.QA_PREFIX = 'qa_';
global.TEST_DOMAIN = '@test.com';
```

### **cypress.config.js**

Configuração específica do Cypress (será criado):

```javascript
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000
  }
};
```

---

## 📝 Nomenclatura de Testes

Siga o padrão **RNXX-funcionalidade.spec.js**:

```
✅ Correto:
  RN01-login-sucesso.spec.js
  RN02-cadastro-com-saldo.spec.js
  RN03-transferencia-diurna.spec.js

❌ Incorreto:
  test.spec.js
  api-tests.spec.js
  login-test.js
```

---

## 🧩 Estrutura de um Teste E2E (Cypress)

**Arquivo:** `cypress/e2e/RN01-login-sucesso.spec.js`

```javascript
describe('RN01 - Login com Sucesso', () => {
  beforeEach(() => {
    // Cleanup antes de cada teste
    cy.task('cleanup-qa');
    cy.visit('/');
  });

  it('Deve fazer login com credenciais válidas', () => {
    // Arrange: preparar dados
    const credentials = {
      email: 'qa_usuario_001@test.com',
      password: 'Senha@123456'
    };

    // Act: executar ação
    cy.get('[data-testid="email"]').type(credentials.email);
    cy.get('[data-testid="password"]').type(credentials.password);
    cy.get('[data-testid="login-button"]').click();

    // Assert: validar resultado
    cy.url().should('include', '/home');
    cy.get('[data-testid="user-name"]')
      .should('be.visible')
      .and('contain', 'qa_usuario_001');
  });
});
```

---

## 🧩 Estrutura de um Teste de API (Supertest)

**Arquivo:** `supertest/RN01-login.spec.js`

```javascript
const request = require('supertest');
const { expect } = require('chai');
const { API_BASE_URL } = require('../config/baseConfig');

describe('RN01 - Login (API)', () => {
  it('Deve fazer login e retornar token JWT', async () => {
    // Arrange
    const credentials = {
      email: 'qa_usuario_001@test.com',
      password: 'Senha@123456'
    };

    // Act
    const response = await request(API_BASE_URL)
      .post('/auth/login')
      .send(credentials);

    // Assert
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
    expect(response.body.token).to.be.a('string');
    expect(response.body.token.split('.').length).to.equal(3); // JWT format
  });
});
```

---

## 📚 Convenção de Dados de Teste

### **Prefixo QA_**

Todos os usuários criados pela automação devem começar com `qa_`:

```javascript
const testUser = {
  name: 'qa_usuario_transferencia_001',
  email: 'qa_usuario_transferencia_001@test.com',
  password: 'Senha@123456'
};
```

**Benefício:** Script `cleanup-qa` identifica e remove automaticamente.

### **Domínio @test.com**

E-mails de teste sempre terminam em `@test.com`:

```javascript
// ✅ Será removido
email: 'usuario@test.com'

// ❌ Não será removido
email: 'usuario@example.com'
```

---

## 🔍 Limpeza de Dados

### **Quando Executar**

1. **Antes de testar localmente**
   ```bash
   npm run cleanup-qa  # Remove testes automáticos anteriores
   ```

2. **Depois de testar localmente**
   ```bash
   npm run cleanup-qa  # Limpa para próxima sessão
   ```

3. **No Pipeline CI/CD** (automático)
   ```yaml
   - name: Cleanup QA Data
     run: npm --workspace packages/tests run cleanup-qa
   ```

### **O que é Removido**

- ✅ Usuários com nome começando em `qa_`
- ✅ Usuários com e-mail terminando em `@test.com`
- ✅ Todas as contas associadas
- ✅ Todas as transações (transferências, depósitos, pagamentos, extratos)

### **O que é PRESERVADO**

- ✅ Usuários manuais (nomes reais, e-mails reais)
- ✅ Dados de testes exploratórios (SBTM)
- ✅ Histórico financeiro para análise

---

## 🎯 Filosofia Kent Beck

**"I get paid for code that works, not for tests, so my philosophy is to write the few tests that are most likely to catch problems."**

Nossa abordagem reflete isso:

1. **Confiança Máxima** 🎯
   - 10 testes bem-desenhados > 100 testes superficiais
   - Foco nos 3 fluxos críticos (Cadastro, Depósito, Transferência)

2. **Mínimo Esforço** ⚡
   - Limpeza cirúrgica vs reset total
   - Reutilização de código (helpers, fixtures)
   - SBTM integrado (Charter cards)

3. **Manutenibilidade**
   - Nomenclatura clara (RNXX-funcionalidade.spec.js)
   - Dados isolados (prefixo qa_)
   - Documentação copiloto (este README)

---

## 🔗 Referências

- **Regras de Negócio:** [README.md](../../README.md)
- **Gestão de Dados:** [GESTAO-DADOS-TESTE.md](./docs/GESTAO-DADOS-TESTE.md)
- **Backlog:** [BACKLOG.md](./BACKLOG.md)
- **API Endpoints:** [packages/api/src/routes](../api/src/routes)
- **Config:** [baseConfig.js](./config/baseConfig.js)

---

## 📞 Troubleshooting

### **Erro: "ECONNREFUSED 127.0.0.1:3333"**
R: API não está rodando. Execute `npm run dev:api` em outro terminal.

### **Erro: "Database error: ER_ACCESS_DENIED_FOR_USER"**
R: Verifique credenciais MySQL em `.env` (DB_USER, DB_PASSWORD).

### **Testes passam localmente mas falham em CI**
R: Verifique portas e variáveis de ambiente no seu CI (GitHub Actions, etc).

### **Dados manuais foram deletados!**
R: Verifique que nomes não começam com `qa_` e e-mails não terminam em `@test.com`.

---

## ✨ Próximos Passos

1. [ ] Criar testes E2E baseado em BACKLOG.md
2. [ ] Criar testes de API (Supertest)
3. [ ] Implementar helpers Cypress (cy.login, cy.transfer, etc)
4. [ ] Configurar CI/CD com GitHub Actions
5. [ ] Documentar Test Charters de SBTM
6. [ ] Treinar time em SBTM

---

**Criado por:** QA Engineering  
**Última atualização:** Abril 2026  
**Status:** 🟢 Ativo

