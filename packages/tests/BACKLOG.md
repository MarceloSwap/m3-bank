# 📋 Backlog de Testes - M3 Bank

**Projeto:** M3 Bank  
**Branch:** docs/planejamento-e-charters  
**Estratégia de Dados:** Limpeza Cirúrgica (prefixo `qa_` e domínio `@test.com`)  
**Filosofia:** Confiança Máxima com Mínimo Esforço (Kent Beck)

---

## 🔄 Fluxo 1: Cadastro → Login → Transferência → Extrato

### **Card 1.1: [RN02] Cadastro com Sucesso - Conta com Saldo**
- **Prioridade:** 🔴 CRÍTICA
- **Tipo:** Teste Automatizado (Cypress E2E + Supertest)
- **RN Associada:** RN02.01, RN02.02, RN02.03, RN02.04, RN02.05, RN02.06, RN02.07
- **Arquivo de Teste:** `cypress/e2e/RN02-cadastro-com-saldo.spec.js`

**Descrição Técnica:**
Validar fluxo completo de cadastro na página `/` (login) com criação de conta com saldo inicial de R$ 1.000,00.

**Massa de Dados:**
```javascript
const testUser = {
  name: 'qa_usuario_cadastro_001',
  email: 'qa_usuario_cadastro_001@test.com',
  password: 'Senha@123456',
  confirmPassword: 'Senha@123456',
  createAccountWithBalance: true
};
```

**Critérios de Aceite:**
- [ ] Usuário preenche todos os campos do formulário de cadastro
- [ ] Sistema valida formato de email com mensagem: "Formato de e-mail inválido" (se inválido)
- [ ] Sistema valida comprimento de senha (mínimo 6 caracteres)
- [ ] Senhas coincidem (validação de "Confirmar senha")
- [ ] Toggle "Criar conta com saldo" está ativo
- [ ] API POST `/auth/register` retorna HTTP 201 com dados da conta
- [ ] Saldo inicial é exatamente R$ 1.000,00
- [ ] Número da conta é exibido na tela após sucesso
- [ ] Token JWT é armazenado em localStorage
- [ ] Usuário é redirecionado automaticamente para `/home`

**Endpoints Testados:**
- `POST /api/auth/register` (Supertest)
- `GET /api/accounts/me` (Supertest)

**Dependências:**
- MySQL deve estar acessível em localhost:3306
- Backend rodando em http://localhost:3333/api
- Frontend rodando em http://localhost:3000

---

### **Card 1.2: [RN01] Login com Sucesso**
- **Prioridade:** 🔴 CRÍTICA
- **Tipo:** Teste Automatizado (Cypress E2E + Supertest)
- **RN Associada:** RN01.01, RN01.02, RN01.03, RN01.04, RN01.05
- **Arquivo de Teste:** `cypress/e2e/RN01-login-sucesso.spec.js` + `supertest/RN01-login.spec.js`

**Descrição Técnica:**
Validar fluxo de login com credenciais corretas e geração de token JWT com expiração de 1 hora.

**Massa de Dados:**
Usar conta criada no Card 1.1 com sufixo `qa_usuario_cadastro_001@test.com`

**Critérios de Aceite:**
- [ ] E-mail e Senha são campos obrigatórios
- [ ] Mensagem de erro exata para campos vazios: "Usuário e senha precisam ser preenchidos"
- [ ] Login com credenciais válidas retorna token JWT
- [ ] Token é armazenado em localStorage
- [ ] Usuário é redirecionado para `/home`
- [ ] Token JWT possui expiração de 1 hora (claim `exp`)
- [ ] Requisições subsequentes incluem header `Authorization: Bearer {token}`
- [ ] Erro 401 ao tentar acessar endpoints protegidos sem token

**Endpoints Testados:**
- `POST /api/auth/login` (Supertest)
- `GET /api/accounts/me` (com token válido)

---

### **Card 1.3: [RN03] Transferência com Sucesso - Valor Dentro do Limite Diurno**
- **Prioridade:** 🔴 CRÍTICA
- **Tipo:** Teste Automatizado (Cypress E2E + Supertest)
- **RN Associada:** RN03.01, RN03.02, RN03.03, RN03.04, RN03.06, RN03.07, RN03.09, RN03.10, RN03.11, RN03.12
- **Arquivo de Teste:** `cypress/e2e/RN03-transferencia-diurna.spec.js` + `supertest/RN03-transferencia.spec.js`

**Descrição Técnica:**
Validar fluxo completo de transferência entre contas com valor dentro do limite diurno (R$ 10.000,00).

**Massa de Dados:**
```javascript
// Conta origem (criada no Card 1.1 ou anterior)
const originAccount = {
  accountNumber: '1001',
  accountDigit: '1',
  balance: 1000.00
};

// Conta destino (usar conta fixa de teste)
const destinationAccount = {
  accountNumber: '1002',
  accountDigit: '1',
  name: 'qa_recebedor_transferencia',
  email: 'qa_recebedor_transferencia@test.com'
};

const transfer = {
  amount: 500.00,
  description: 'Teste de transferência diurna'
};
```

**Critérios de Aceite:**
- [ ] Campos Número e Dígito aceitam apenas números (RN03.02)
- [ ] Campo Descrição é obrigatório (RN03.03)
- [ ] Valor mínimo é R$ 10,00 (mensagem: "Valor mínimo para transferência é de R$ 10,00")
- [ ] Conta de destino existe e está ativa (validação contra DB)
- [ ] Saldo da conta origem é verificado (>= valor transferência)
- [ ] Horário de transação é validado para limite diurno (06h00-19h59 = máximo R$ 10.000,00)
- [ ] Transferência NÃO para própria conta (RN03.09)
- [ ] API POST `/api/transfers` retorna HTTP 201 com confirmação
- [ ] Saldo da conta origem é debitado corretamente
- [ ] Saldo da conta destino é creditado corretamente
- [ ] Lançamento é registrado em `lancamentos` com tipo "Transferência"
- [ ] Lista de contas disponíveis exclui a conta própria (RN03.11)
- [ ] Botão de alternância de lista fica no header (RN03.12)
- [ ] Seleção automática de campos ao clicar em conta da lista
- [ ] Mensagem de sucesso: "Transferência realizada com sucesso"
- [ ] Usuário é redirecionado para `/extrato` após sucesso

**Endpoints Testados:**
- `POST /api/transfers` (Supertest)
- `GET /api/accounts/` (Supertest - listar contas)
- `GET /api/accounts/me` (verificar saldo atualizado)

---

### **Card 1.4: [RN06] Extrato - Visualização Completa com Filtros**
- **Prioridade:** 🟡 ALTA
- **Tipo:** Teste Automatizado (Cypress E2E)
- **RN Associada:** RN06.01, RN06.02, RN06.03, RN06.04, RN06.05, RN06.06
- **Arquivo de Teste:** `cypress/e2e/RN06-extrato-visualizacao.spec.js`

**Descrição Técnica:**
Validar visualização do extrato com histórico de transações, paginação e filtros de período.

**Critérios de Aceite:**
- [ ] Saldo disponível é exibido e atualizado em tempo real
- [ ] Extrato lista todas as transações do usuário
- [ ] Paginação funciona corretamente (limite de itens por página)
- [ ] Cada transação exibe: data/hora, tipo, valor, descrição, favorecido
- [ ] Valores de saída (débito) são exibidos em vermelho com prefixo `-`
- [ ] Valores de entrada (crédito) são exibidos em verde
- [ ] Descrição vazia é exibida como `-`
- [ ] Filtros de período funcionam: "Últimos 7 dias", "Últimos 15 dias", "Últimos 30 dias"
- [ ] Filtro de período reduz transações exibidas corretamente
- [ ] API GET `/api/accounts/statement` retorna dados paginados
- [ ] Transferências recebidas mostram número da conta do remetente

**Endpoints Testados:**
- `GET /api/accounts/statement` (com parâmetros de período)
- `GET /api/accounts/me`

---

## 💰 Fluxo 2: Depósito → Extrato

### **Card 2.1: [RN04] Depósito com Sucesso**
- **Prioridade:** 🟡 ALTA
- **Tipo:** Teste Automatizado (Cypress E2E + Supertest)
- **RN Associada:** RN04.01, RN04.02, RN04.03, RN04.04, RN04.05, RN04.06, RN04.07, RN04.08
- **Arquivo de Teste:** `cypress/e2e/RN04-deposito-sucesso.spec.js` + `supertest/RN04-deposito.spec.js`

**Descrição Técnica:**
Validar fluxo completo de depósito em conta com validações de limites e atualização de saldo.

**Massa de Dados:**
```javascript
const deposit = {
  accountNumber: '1001',
  accountDigit: '1',
  amount: 500.00,
  description: 'Teste de depósito'
};
```

**Critérios de Aceite:**
- [ ] Campos Número e Dígito aceitam apenas números
- [ ] Campo Descrição é obrigatório
- [ ] Valor mínimo é R$ 10,00
- [ ] Valor máximo é R$ 10.000,00
- [ ] Conta de destino existe e está ativa (validação contra DB)
- [ ] API POST `/api/deposits` retorna HTTP 201
- [ ] Saldo da conta destino é creditado corretamente
- [ ] Lançamento é registrado em `lancamentos` com tipo "Depósito"
- [ ] Mensagem de confirmação exibe novo saldo
- [ ] Lista de contas exclui conta própria
- [ ] Botão de alternância de lista fica no header
- [ ] Seleção automática de campos ao clicar em conta da lista
- [ ] Em caso de falha, nenhuma alteração é persistida (Rollback)

**Endpoints Testados:**
- `POST /api/deposits` (Supertest)
- `GET /api/accounts/me` (verificar saldo atualizado)

---

### **Card 2.2: [RN06] Extrato - Verificação de Depósito**
- **Prioridade:** 🟡 ALTA
- **Tipo:** Teste Automatizado (Cypress E2E)
- **RN Associada:** RN06.01, RN06.02, RN06.03, RN06.04
- **Arquivo de Teste:** `cypress/e2e/RN06-extrato-deposito.spec.js`

**Descrição Técnica:**
Validar que depósito realizado no Card 2.1 aparece corretamente no extrato.

**Critérios de Aceite:**
- [ ] Transação de depósito aparece na lista de extrato
- [ ] Tipo é exibido como "Depósito"
- [ ] Valor é exibido em verde (entrada)
- [ ] Saldo total é atualizado corretamente
- [ ] Descrição do depósito é exibida
- [ ] Data/hora da transação é registrada corretamente

---

## 💳 Fluxo 3: Pagamento PIX (Simulado) → Extrato

### **Card 3.1: [RN05] Pagamento PIX - Simulação com Sucesso**
- **Prioridade:** 🟡 ALTA
- **Tipo:** Teste Automatizado (Cypress E2E + Supertest)
- **RN Associada:** RN05.01, RN05.02, RN05.03
- **Arquivo de Teste:** `cypress/e2e/RN05-pagamento-pix.spec.js` + `supertest/RN05-pagamento.spec.js`

**Descrição Técnica:**
Validar fluxo de simulação de pagamento PIX com validação de saldo e débito.

**Massa de Dados:**
```javascript
const pixPayment = {
  amount: 150.00,
  qrCodeValue: 'QR_CODE_MOCK_VALUE_123'
};
```

**Critérios de Aceite:**
- [ ] QR Code estático é exibido na tela (Mockado)
- [ ] Usuário preenche valor desejado
- [ ] Botão "Simular Leitura" inicia o processamento
- [ ] Sistema valida saldo disponível
- [ ] Erro se saldo for insuficiente
- [ ] API POST `/api/payments/pix/simulate` retorna HTTP 201
- [ ] Valor é debitado da conta
- [ ] Lançamento é registrado em `lancamentos` com tipo "PIX"
- [ ] Mensagem de confirmação é exibida
- [ ] Em caso de falha, nenhuma alteração é persistida (Rollback)

**Endpoints Testados:**
- `POST /api/payments/pix/simulate` (Supertest)
- `GET /api/accounts/me` (verificar saldo atualizado)

---

### **Card 3.2: [RN06] Extrato - Verificação de Pagamento PIX**
- **Prioridade:** 🟡 ALTA
- **Tipo:** Teste Automatizado (Cypress E2E)
- **RN Associada:** RN06.01, RN06.02, RN06.03, RN06.04
- **Arquivo de Teste:** `cypress/e2e/RN06-extrato-pix.spec.js`

**Descrição Técnica:**
Validar que pagamento PIX realizado no Card 3.1 aparece corretamente no extrato.

**Critérios de Aceite:**
- [ ] Transação de PIX aparece na lista de extrato
- [ ] Tipo é exibido como "PIX"
- [ ] Valor é exibido em vermelho com prefixo `-` (saída)
- [ ] Saldo total é atualizado corretamente
- [ ] Data/hora da transação é registrada corretamente

---

## 🔍 Test Charters - Testes Exploratórios (SBTM)

### **Charter 4.1: [SBTM] Riscos de API - Heurística VADER**
- **Prioridade:** 🟠 MÉDIA
- **Tipo:** Teste Exploratório (Sessão de SBTM)
- **Arquivo de Charter:** `docs/charters/RN_CHARTER-API-VADER.md`
- **Duração Sugerida:** 90 minutos
- **Testador:** QA Engenheiro Sênior

**Foco de Sessão:**
Investigar vulnerabilidades e comportamentos inesperados da API usando a heurística VADER (Volume, Attributes, Defaults, Exceptional Handling, Requests).

**Objetivos:**
1. **Volume (V):** Testar com grandes volumes de dados
   - Transferências com valores muito altos (R$ 999.999.999)
   - Listas com centenas de transações no extrato
   - Múltiplas requisições simultâneas (concorrência)

2. **Attributes (A):** Testar valores nos limites (boundary)
   - Transferência com valor exatamente R$ 5.000,00 (requer token especial?)
   - Transferência com valor R$ 5.000,01 (requer token especial)
   - Nomes com caracteres especiais, acentos, emojis
   - E-mails com múltiplos '@', pontos consecutivos

3. **Defaults (D):** Testar ausência de dados
   - Transferências com descrição vazia
   - Contas sem saldo (zero)
   - Requisições sem header Authorization

4. **Exceptional Handling (E):** Testar cenários excepcionais
   - Token JWT expirado
   - Token JWT adulterado/inválido
   - Conexão de banco de dados interrompida durante transação
   - Mesmo usuário logado em dois navegadores (sessão duplicada)

5. **Request Issues (R):** Testar problemas na requisição
   - Métodos HTTP incorretos (GET em vez de POST)
   - Content-Type incorreto
   - Payloads malformados (JSON inválido)
   - Payloads muito grandes (> 10MB)

**Saídas Esperadas:**
- Relatório de sessão SBTM descrevendo riscos identificados
- Reprodução de bugs críticos (se encontrados)
- Recomendações de validação adicional

---

### **Charter 4.2: [SBTM] Riscos de UI - Valor Limite e Concorrência**
- **Prioridade:** 🟠 MÉDIA
- **Tipo:** Teste Exploratório (Sessão de SBTM)
- **Arquivo de Charter:** `docs/charters/RN_CHARTER-UI-BOUNDARY.md`
- **Duração Sugerida:** 90 minutos
- **Testador:** QA Engenheiro Sênior

**Foco de Sessão:**
Investigar comportamentos de UI em cenários de valores limite e ações concorrentes.

**Objetivos:**
1. **Valor Limite (Boundary Value):**
   - Transferência com valor 9,99 (abaixo do mínimo R$ 10,00)
   - Transferência com valor 10,00 (no limite mínimo)
   - Transferência com valor 10,01 (acima do mínimo)
   - Transferência com valor 9.999,99 (abaixo do limite diurno)
   - Transferência com valor 10.000,00 (no limite diurno)
   - Transferência com valor 10.000,01 (acima do limite diurno)
   - Transferência noturna (após 20h) com valores no limite noturno

2. **Concorrência no Botão de Enviar:**
   - Clicar múltiplas vezes no botão "Transferir agora" rapidamente
   - Submeter formulário e clicar novamente antes de receber resposta
   - Fechar aba/navegador durante o processamento
   - Alterar dados do formulário após clicar em enviar
   - Desconectar internet durante transferência

3. **Interações com Lista de Contas:**
   - Abrir/fechar lista de contas repetidamente
   - Buscar conta enquanto scrolling
   - Selecionar conta rapidamente após busca
   - Clicar em conta que desaparece da lista

4. **Validações de UI:**
   - Mensagens de erro desaparecem corretamente após correção
   - Focus está correto após erro
   - Campo inválido é destacado visualmente
   - Modal de confirmação é modal (não permite clicar fora)

5. **Estado Visual:**
   - Spinner/loading é exibido durante requisição
   - Botão é desabilitado durante processamento
   - Valores são formatados corretamente (R$ 10.000,00 vs 10000)
   - Saldo é atualizado em tempo real

**Saídas Esperadas:**
- Relatório de sessão SBTM com encontrados de UI
- Screenshots de comportamentos inesperados
- Recomendações de melhorias de UX

---

## 📊 Resumo de Execução

| Card | Funcionalidade | Tipo | Status | Responsável |
|------|---|---|---|---|
| 1.1 | Cadastro com Saldo | E2E + API | ⬜ Não Iniciado | |
| 1.2 | Login | E2E + API | ⬜ Não Iniciado | |
| 1.3 | Transferência Diurna | E2E + API | ⬜ Não Iniciado | |
| 1.4 | Extrato Completo | E2E | ⬜ Não Iniciado | |
| 2.1 | Depósito | E2E + API | ⬜ Não Iniciado | |
| 2.2 | Extrato (Depósito) | E2E | ⬜ Não Iniciado | |
| 3.1 | Pagamento PIX | E2E + API | ⬜ Não Iniciado | |
| 3.2 | Extrato (PIX) | E2E | ⬜ Não Iniciado | |
| 4.1 | Charter SBTM (API) | SBTM | ⬜ Não Iniciado | |
| 4.2 | Charter SBTM (UI) | SBTM | ⬜ Não Iniciado | |

---

## 📚 Referências

- **Documentação de Regras de Negócio:** `README.md`
- **Configuração de Ambiente:** `packages/tests/config/baseConfig.js`
- **Limpeza de Dados:** `packages/tests/scripts/cleanup-tests.js`
- **Endpoints da API:** `packages/api/src/routes/`

