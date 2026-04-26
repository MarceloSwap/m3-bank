# ✅ Checklist de Implementação - M3 Bank Test Infrastructure

## 📋 Estrutura de Diretórios Criada

- [x] `packages/tests/` - Raiz do framework de testes
- [x] `packages/tests/config/` - Configurações globais
- [x] `packages/tests/cypress/e2e/` - Testes E2E
- [x] `packages/tests/cypress/fixtures/` - Dados de teste
- [x] `packages/tests/cypress/support/` - Helpers Cypress
- [x] `packages/tests/supertest/` - Testes de API
- [x] `packages/tests/scripts/` - Scripts de automação
- [x] `packages/tests/docs/` - Documentação

---

## 📦 Arquivos Criados

### Configuração
- [x] `package.json` - Dependências e scripts
- [x] `cypress.config.js` - Configuração Cypress
- [x] `config/baseConfig.js` - URLs e constantes globais

### Scripts
- [x] `scripts/cleanup-tests.js` - Limpeza cirúrgica de dados QA

### Templates de Teste
- [x] `cypress/e2e/RN01-login-sucesso.spec.js.template` - Exemplo E2E
- [x] `supertest/RN01-login.spec.js.template` - Exemplo API

### Documentação
- [x] `README.md` - Guia completo do framework
- [x] `BACKLOG.md` - Cards de teste para GitHub Projects
- [x] `docs/GESTAO-DADOS-TESTE.md` - Wiki sobre estratégia de dados
- [x] `docs/CHARTER-API-VADER.md` - Charter SBTM para API
- [x] `docs/CHARTER-UI-BOUNDARY.md` - Charter SBTM para UI

---

## 🎯 Próximas Ações para o Time

### 1️⃣ **Instalar Dependências** (5 min)
```bash
cd packages/tests
npm install
```

### 2️⃣ **Verificar Ambiente** (10 min)
```bash
# Terminal 1: API
cd packages/api && npm run dev

# Terminal 2: Web
cd packages/web && npm run dev

# Terminal 3: Testes
cd packages/tests
npm run cleanup-qa  # Verificar conexão com banco
```

### 3️⃣ **Ler Documentação** (30 min)
- [ ] README.md - Visão geral
- [ ] GESTAO-DADOS-TESTE.md - Entender limpeza cirúrgica
- [ ] BACKLOG.md - Ver cards de teste

### 4️⃣ **Implementar Primeiros Testes** (4-6 horas)
**Prioridade 1 (Crítica):**
- [ ] Card 1.1: Cadastro com Saldo (`RN02-cadastro-com-saldo.spec.js`)
- [ ] Card 1.2: Login (`RN01-login-sucesso.spec.js`)
- [ ] Card 1.3: Transferência (`RN03-transferencia-diurna.spec.js`)

**Usar templates como referência:**
- Copiar `RN01-login-sucesso.spec.js.template` → `cypress/e2e/RN01-login-sucesso.spec.js`
- Copiar `RN01-login.spec.js.template` → `supertest/RN01-login.spec.js`
- Adaptar para contexto específico

### 5️⃣ **Executar Testes** (10 min)
```bash
cd packages/tests

# Testes de API
npm run test:api

# Testes E2E interativo
npm run test:e2e:open

# Todos os testes
npm run test:all
```

### 6️⃣ **Limpar Dados Após Testes** (5 min)
```bash
npm run cleanup-qa
```

---

## 🔧 Customizações Necessárias

### baseConfig.js
Já pré-configurado com valores padrão:
- API: http://localhost:3333/api
- Web: http://localhost:3000
- DB: localhost:3306
- QA Prefix: `qa_`
- Test Domain: `@test.com`

**Se precisar mudar, edite variáveis de ambiente em `.env`**

### cypress.config.js
Já pré-configurado. Ajustes opcionais:
- `baseUrl`: já está `http://localhost:3000`
- `viewportWidth/Height`: ajustar se necessário
- `defaultCommandTimeout`: já está 10s

### cleanup-tests.js
Já pronto. Apenas execute quando precisar limpar dados.

---

## 📊 Estrutura de Nomenclatura

### Testes E2E
```
cypress/e2e/RN[XX]-[funcionalidade-em-kebab-case].spec.js

Exemplos:
  RN01-login-sucesso.spec.js
  RN02-cadastro-com-saldo.spec.js
  RN03-transferencia-diurna.spec.js
```

### Testes de API
```
supertest/RN[XX]-[funcionalidade-em-kebab-case].spec.js

Exemplos:
  RN01-login.spec.js
  RN02-cadastro.spec.js
  RN03-transferencia.spec.js
```

### Dados de Teste
```
Prefix: qa_
Domain: @test.com

Exemplos:
  qa_usuario_login_001@test.com
  qa_usuario_transferencia_001@test.com
  qa_usuario_deposito_001@test.com
```

---

## 🧩 Estrutura Dos Testes

### Teste E2E (Cypress)

```javascript
describe('RN01 - Login com Sucesso', () => {
  // Setup
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  // Testes
  it('Deve fazer login com credenciais válidas', () => {
    // Arrange: preparar
    // Act: executar
    // Assert: validar
  });

  // Cleanup
  afterEach(() => {
    cy.clearLocalStorage();
  });
});
```

### Teste de API (Supertest)

```javascript
describe('RN01 - Login (API)', () => {
  // Setup
  before(async function () {
    // preparar usuário de teste
  });

  // Testes
  it('Deve fazer login com credenciais válidas', async function () {
    const response = await request(API_BASE_URL)
      .post('/auth/login')
      .send(credentials);
    
    expect(response.status).to.equal(200);
  });

  // Cleanup
  after(async function () {
    // cleanup opcional
  });
});
```

---

## 🔐 Segurança de Dados

### ✅ Sempre Faça
- Use prefixo `qa_` em nomes de usuários de teste
- Use domínio `@test.com` em e-mails de teste
- Execute `npm run cleanup-qa` antes/depois de testes locais
- Verifique que dados manuais não foram afetados

### ❌ Nunca Faça
- Não use dados reais (João Silva, seu email, etc)
- Não copie dados de produção para testes
- Não execute `npm run seed-db` sem avisar o time
- Não modifique cleanup-tests.js sem revisão

---

## 📈 Roadmap de Testes

### Fase 1 (Semana 1-2): Fluxos Críticos
- [x] Estrutura criada
- [ ] Testes de Cadastro e Login
- [ ] Testes de Transferência
- [ ] Testes de Extrato

### Fase 2 (Semana 3): Fluxos Secundários
- [ ] Testes de Depósito
- [ ] Testes de Pagamento PIX
- [ ] Testes de Validação (campos vazios, limites)

### Fase 3 (Semana 4): Testes Exploratórios
- [ ] Session SBTM - Riscos de API (VADER)
- [ ] Session SBTM - Riscos de UI (Boundary)
- [ ] Documentar bugs encontrados

### Fase 4 (Semana 5+): CI/CD
- [ ] Integrar com GitHub Actions
- [ ] Executar testes automaticamente no PR
- [ ] Gerar relatórios de cobertura

---

## 📞 Troubleshooting Rápido

### **Erro: "ECONNREFUSED 127.0.0.1:3333"**
```
✅ Solução: npm run dev:api (terminal separado)
```

### **Erro: "Database error: ER_ACCESS_DENIED"**
```
✅ Solução: Verificar .env (DB_USER, DB_PASSWORD)
```

### **Teste passa local, falha em CI**
```
✅ Solução: Verificar variáveis de ambiente no CI
```

### **Dados foram deletados acidentalmente**
```
✅ Solução: Verificar se nomes começam com qa_ e emails com @test.com
```

### **Scripts não encontram baseConfig.js**
```
✅ Solução: Executar npm install em packages/tests
```

---

## 🎓 Referências

| Documento | Propósito |
|-----------|-----------|
| [README.md](./README.md) | Guia principal do framework |
| [BACKLOG.md](./BACKLOG.md) | Cards de teste (import em GitHub Projects) |
| [GESTAO-DADOS-TESTE.md](./docs/GESTAO-DADOS-TESTE.md) | Por que limpeza cirúrgica, não reset |
| [CHARTER-API-VADER.md](./docs/CHARTER-API-VADER.md) | Testes exploratórios (API) |
| [CHARTER-UI-BOUNDARY.md](./docs/CHARTER-UI-BOUNDARY.md) | Testes exploratórios (UI) |
| [config/baseConfig.js](./config/baseConfig.js) | Configurações globais |
| [scripts/cleanup-tests.js](./scripts/cleanup-tests.js) | Limpeza cirúrgica |

---

## ✨ Dicas Finais

1. **Leia os Templates**
   - `RN01-login-sucesso.spec.js.template` para E2E
   - `RN01-login.spec.js.template` para API
   - Copie, adapte e customize

2. **Use Data-TestID**
   - Adicione `data-testid` no frontend para melhor seletores
   - Exemplo: `<input data-testid="email-input" />`

3. **Mantenha Dados Isolados**
   - Sempre prefixo `qa_` + `@test.com`
   - Facilita limpeza e rastreamento

4. **Documente Encontrados**
   - Bugs → GitHub Issues
   - Recomendações → Pull Request
   - Charters SBTM → `docs/`

5. **Colabore com o Time**
   - Compartilhe descobertas
   - Revise códigos de teste
   - Treine em SBTM

---

**Status:** ✅ **READY FOR IMPLEMENTATION**  
**Criado:** Abril 2026  
**Última Atualização:** Hoje  
**Responsável:** QA Engineering Team

