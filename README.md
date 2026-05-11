# M3 Bank

Monorepo de portfolio para QA Engineering com API REST/GraphQL na porta `3334`, Web Next.js na porta `3000`, Cypress E2E, Supertest API, GitFlow e documentacao baseada em ISO 29119-3.

## Stack de QA

- **E2E Web:** Cypress em `packages/tests/ui`.
- **API:** Supertest + Mocha + Mochawesome em `packages/tests/api`.
- **Massa de dados:** Cypress fixtures em `packages/tests/ui/cypress/fixtures/usuarios.json` e scripts de seed da API.
- **Tecnicas:** Analise de Valor Limite, rastreabilidade RN/CT, SBTM e matriz de risco Impacto x Probabilidade.
- **CI/CD:** `.github/workflows/e2e-tests.yml` executa Cypress em `push` e `pull_request` para `develop`, subindo MySQL, API e Web antes da automacao.
- **Wiki/ISO 29119-3:** arquivos em `docs/m3-bank.wiki`.
- **Nomenclatura validada:** RN01 = Cadastro de Contas; RN02 = Login e Autenticacao.

## Estrutura do projeto de testes

O diretorio `packages/tests` concentra a entrega principal de QA do projeto: automacao de API, automacao E2E, BDD, massa de dados, relatorios e limpeza cirurgica dos dados gerados pelos testes.

```text
m3-bank/
├── docs/
│   ├── m3-bank.wiki/          # Documentação QA (ISO 29119-3)[cite: 1]
│   └── mindmaps/              # Mapas mentais de API e Web[cite: 1]
└── packages/
    ├── api/                   # Backend REST/GraphQL (Porta 3334)[cite: 1]
    ├── web/                   # Frontend Next.js (Porta 3000)[cite: 1]
    └── tests/                 # Core de QA e Automação[cite: 1]
        ├── api/               # Testes de API (Supertest + Mocha)[cite: 1]
        │   ├── config/        # Configurações globais[cite: 1]
        │   ├── docs/          # Auditoria VADER e Gestão de Dados[cite: 1]
        │   ├── fixtures/      # Payloads e massas de teste[cite: 1]
        │   ├── scripts/       # Scripts de limpeza cirúrgica[cite: 1]
        │   └── tests/         # Specs BDD (Gherkin) e REST[cite: 1]
        ├── ui/                # Testes End-to-End (Cypress)[cite: 1]
        │   ├── cypress/
        │   │   ├── e2e/       # Specs RN01-RN07[cite: 1]
        │   │   ├── fixtures/  # Massa de dados da UI[cite: 1]
        │   │   └── support/   # Commands e Setup global[cite: 1]
        │   └── cypress.config.js
        ├── package.json       # Scripts de execução e CI/CD[cite: 1]
        └── README.md          # Guia técnico da suíte de testes[cite: 1]
```

### Mapa rapido de `packages/tests`

| Caminho | Papel na estrategia de QA |
|---------|----------------------------|
| `packages/tests/api/tests/rest` | Testes automatizados de API com Supertest + Mocha |
| `packages/tests/api/tests/bdd` | Features Gherkin que documentam RN01 a RN07 |
| `packages/tests/api/tests/rest/VADER-api.spec.js` | Auditoria de resiliência por heuristica VADER |
| `packages/tests/ui/cypress/e2e` | Testes E2E Cypress dos fluxos reais da aplicacao |
| `packages/tests/ui/cypress/fixtures` | Massa de dados para automacao de UI |
| `packages/tests/api/fixtures` | Payloads reutilizaveis para automacao de API |
| `packages/tests/api/scripts/cleanup-tests.js` | Sanitizacao seletiva dos dados criados pela automacao |
| `packages/tests/reports` | Relatorios gerados pela execucao da suite |
| `packages/tests/ui/cypress/screenshots` | Evidencias visuais de falhas E2E |

## GitFlow

- `main`: producao, recebe merges estabilizados.
- `develop`: integracao, alvo da pipeline E2E.
- `feature/<descricao>`: evolucao funcional ou tecnica.
- `test/<descricao>`: automacao, massa de teste, charters e evidencias de QA.
- `hotfix/<descricao>`: correcao urgente a partir de `main`.

Fluxo recomendado:

```bash
git checkout main
git checkout -b develop
git checkout -b feature/ui-clean-layout
git checkout -b test/rn01-rn07-cypress
```

## Comandos principais



```bash
npm install
npm run seed
npm run dev:api
npm run dev:web
npm run test:e2e
```
  <img src="https://github.com/MarceloSwap/m3-bank/blob/8f0f11ab77b26f0412b58d5b7a1d0f1117c14b48/docs/02%20test%20web.gif" alt="Cypress" whith="100%">

```bash
npm run test:api
```
  <img src="https://github.com/MarceloSwap/m3-bank/blob/8f0f11ab77b26f0412b58d5b7a1d0f1117c14b48/docs/01%20test%20api.gif" alt="Mocha-Chai-Supertest" whith="100%">
  
```bash
npm run cleanup:dry
npm run cleanup
```

## Documentacao de entrega

- Wiki local/GitHub Wiki: `docs/m3-bank.wiki`
- Casos de Teste ISO 29119-3: `docs/m3-bank.wiki/4-Casos-de-Teste.md`
- Testes Exploratorios SBTM: `docs/m3-bank.wiki/5‐Testes‐Exploratorios.md`
- Reporte de Defeitos: `docs/m3-bank.wiki/6-Reporte-de-Defeitos.md`
- Relatorio de Execucao QA: `docs/m3-bank.wiki/7-Relatorios-de-Execucao.md`
- Mapa mental API: `docs/mindmaps/api.md`

  <img src="https://github.com/MarceloSwap/m3-bank/blob/69c36255c8bdf09f9db472b3bf4d80ac6d048f83/docs/mindmaps/api.png" alt="API" whith="100%">

- Mapa mental Web: `docs/mindmaps/web.md`

  <img src="https://github.com/MarceloSwap/m3-bank/blob/69c36255c8bdf09f9db472b3bf4d80ac6d048f83/docs/mindmaps/frontend.png" alt="Frontend" whith="100%">

## Métricas auditadas em 02/05/2026

| Camada | Testes | Pass | Fail | Taxa |
|--------|-------:|-----:|-----:|------:|
| API - Mocha/Supertest | 70 | 69 | 1 | 98,5% |
| E2E - Cypress | 24 | 23 | 1 | 95,8% |
| Total | 94 | 92 | 2 | 97,9% |

Falhas conhecidas:
- RN03 API: contrato divergente em token inválido, retornando `400` quando o teste espera `401`.
- RN03 E2E: seletor/elemento não encontrado no fluxo headless de limite noturno.

---

# 1. Regras de Negócio e Requisitos

Este documento centraliza todas as regras de negócio, limites de sistema e comportamentos esperados do **M3 Bank**. Ele serve como a **Fonte da Verdade (Source of Truth)** para a automação de testes (Cypress, Supertest) e para as sessões de testes exploratórios.

---

## 1. Cadastro de Contas
Fluxo de entrada de novos usuarios no M3 Bank.

* **RN01.01:** Os campos `Nome`, `E-mail`, `Senha` e `Confirmacao de senha` sao obrigatorios.
* **RN01.02:** O cadastro valido deve criar a conta com sucesso.
* **RN01.03:** O sistema deve bloquear cadastro com e-mail ja existente.
* **RN01.04:** A senha deve respeitar o limite minimo definido para cadastro.
* **RN01.05:** As entradas de `Senha` e `Confirmacao de senha` devem ser exatamente iguais.
* **RN01.06 (API):** A conta criada pela API deve iniciar com saldo de **R$ 1.000,00** quando a regra de saldo inicial estiver ativa.

---

## 2. Login e Autenticacao
O acesso ao sistema e restrito e gerenciado via tokens JWT (JSON Web Tokens).

* **RN02.01:** Os campos `E-mail` e `Senha` sao de preenchimento obrigatorio.
* **RN02.02:** Credenciais validas devem autenticar o usuario e armazenar um JWT.
* **RN02.03:** O sistema deve rejeitar e-mail nao cadastrado.
* **RN02.04:** O sistema deve rejeitar senha incorreta.
* **RN02.05:** A tentativa de login com campos vazios deve exibir mensagem de validacao na UI.
* **RN02.06 (API):** O login valido deve retornar token JWT.
* **RN02.07 (Seguranca):** Requisicoes autenticadas sem token ou com token invalido devem retornar HTTP `401 Unauthorized`.

---

## 3. Transferências (Core Business)
Este é o módulo mais crítico do sistema e possui regras estritas de integridade.

* **RN03.01:** Transferências só podem ser enviadas para contas de destino que existam e estejam **ativas**. Caso contrário, exibir: *"Conta inválida ou inexistente"*.
* **RN03.02:** Os campos numéricos (Número e Dígito da conta) devem aceitar **apenas números**.
* **RN03.03:** O campo `Descrição` é de preenchimento obrigatório.
* **RN03.04 (Limites Mínimos):** O valor mínimo para qualquer transferência é de **R$ 10,00** (Tentativas menores ou negativas devem ser bloqueadas).
* **RN03.05 (Autorização Especial):** Transferências com valores acima de **R$ 5.000,00** exigem um token de autorização específico (`123456`) enviado na requisição.
* **RN03.06 (Saldo):** O sistema deve validar se o saldo da conta de origem é maior ou igual ao valor da transferência antes de processar o débito.
* **RN03.07:** O sucesso da transação deve exibir: *"Transferência realizada com sucesso"*, deduzir o valor do saldo em tempo real e redirecionar o usuário para a tela de Extrato.
* **RN03.08 (Transações Síncronas):** Em caso de falha no meio do processo, a transação não deve ser parcialmente concluída. Todo o processo deve ser revertido (Rollback).
* **RN03.09 (Anti-Fraude):** O sistema não deve permitir que a conta de origem seja a mesma da conta de destino. Caso ocorra, exibir: *"Não é possível transferir para a própria conta"*.
* **RN03.10 (Limite Dinâmico/Noturno):** Por regras de segurança, o teto máximo de transferência varia conforme o horário da transação (fuso horário local):
  * **Das 06h00 às 19h59 (Diurno):** Limite máximo de **R$ 10.000,00** por transação.
  * **Das 20h00 às 05h59 (Noturno):** Limite máximo cai para **R$ 1.000,00** por transação. Valores superiores devem ser bloqueados com a mensagem: *"Valor excede o limite noturno permitido"*.
* **RN03.11 (Lista de Contas):** A tela de transferências deve apresentar uma lista expansível com todas as contas ativas disponíveis para transferência, exibindo nome do titular e número da conta. A conta própria do usuário logado deve ser automaticamente excluída da lista.
* **RN03.12 (Ações no Header):** Na rota `/transferencia`, o botão de alternância da lista de contas disponíveis deve ficar na área de ações do cabeçalho (ao lado do badge da conta e do botão `Sair`). Ao clicar em uma conta da lista, os campos de número e dígito devem ser preenchidos automaticamente.

---

## 4. Depósito Bancário
Funcionalidade para creditar valores em contas existentes.

* **RN04.01:** Depósitos só podem ser realizados para contas que existam e estejam **ativas**. Caso contrário, exibir: *"Conta inválida ou inexistente"*.
* **RN04.02:** Os campos numéricos (Número e Dígito da conta) devem aceitar **apenas números**.
* **RN04.03:** O campo `Descrição` é de preenchimento obrigatório.
* **RN04.04 (Limites):** 
  * Valor mínimo para depósito: **R$ 10,00**
  * Valor máximo para depósito: **R$ 10.000,00**
* **RN04.05 (Processamento):** O valor depositado deve ser creditado imediatamente no saldo da conta destino.
* **RN04.06:** O sucesso da operação deve exibir uma mensagem confirmando o depósito e o novo saldo, além de registrar a transação no extrato como "Depósito".
* **RN04.07 (Transações Síncronas):** Em caso de falha, a operação deve ser completamente revertida (Rollback).
* **RN04.08 (Lista de Contas e Header):** Na rota `/deposito`, o botão de alternância da lista de contas disponíveis deve ficar na área de ações do cabeçalho (ao lado do badge da conta e do botão `Sair`). A lista deve exibir apenas contas ativas diferentes da conta logada e, ao clicar em um item, preencher automaticamente número e dígito da conta destino.

---

## 5. Pagamentos (Pix Simulado)
Funcionalidade interativa para testes de fluxo de pagamento.

* **RN05.01:** A tela deve apresentar um QR Code estático (Mockado).
* **RN05.02:** O usuário deve informar um valor e clicar no botão *"Simular Leitura"*.
* **RN05.03:** O sistema deve simular o processamento, validar se há saldo suficiente, debitar o valor correspondente e gerar um registro de saída no extrato, sem envolver integrações bancárias reais.

---

## 6. Extrato e Saldo
Visualização do histórico financeiro.

* **RN06.01:** O painel principal deve exibir o **saldo disponível atualizado** no momento do acesso.
* **RN06.02 (API):** A listagem do extrato deve ser suportada por paginação no back-end (limite de itens por página).
* **RN06.03 (Formatação Visual):** Cada registro de transação deve exibir data e hora, tipo de transação (Abertura de conta, Transferência enviada, Transferência recebida, Depósito, PIX), valor, descrição (ou "-"), favorecido e conta do favorecido (quando houver). O campo "Nome de quem recebeu" não deve ser exibido separadamente quando a informação já estiver representada como "Favorecido".
* **RN06.04 (Cores e Sinais):**
  * Valores de **Saída** (Débito) devem ser renderizados na cor **Vermelha** e prefixados com sinal negativo `(-)`.
  * Valores de **Entrada** (Crédito) devem ser renderizados na cor **Verde**.
* **RN06.05:** Transações sem comentário devem exibir um hífen `(-)` no lugar da descrição.
* **RN06.06 (Filtros):** O usuário deve ser capaz de filtrar o extrato através de botões de período rápido: *"Últimos 7 dias"*, *"Últimos 15 dias"* e *"Últimos 30 dias"*.
* **RN06.07 (Home - Movimentações Recentes):** O painel de movimentações recentes da Home deve exibir a descrição da transação e, quando existir conta relacionada, mostrar também o número da conta no mesmo bloco de informação.

---

## 7. Perfil do Usuário
Gerenciamento de dados pessoais e configurações de segurança.

* **RN07.01:** O usuário deve poder alterar seu nome completo através de uma interface dedicada.
* **RN07.02:** O campo nome deve ter validação de mínimo 2 caracteres e não pode ser vazio.
* **RN07.03:** O usuário deve poder alterar sua senha, sendo obrigatório informar a senha atual para confirmação.
* **RN07.04:** A nova senha deve ter mínimo 6 caracteres e deve ser confirmada em um campo separado.
* **RN07.05:** Alterações de senha com senha atual incorreta devem ser bloqueadas com mensagem de erro.
* **RN07.06:** Sucesso nas alterações deve exibir mensagem de confirmação e atualizar os dados em tempo real.
* **RN07.07 (Interface):** A tela de perfil deve ser organizada em abas separadas para alteração de nome e senha.

---



## Estrutura resumida

```text
m3-bank/
  package.json
  packages/
    api/
    tests/
    web/
```

## Pre-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- MySQL 8 ou superior

## 1. Instalar dependencias

Na raiz do projeto:

```bash
npm install
```

## 2. Configurar o banco de dados

Crie um banco MySQL com o nome:

```sql
CREATE DATABASE m3_bank;
```

**Observações:**
- O banco usa nomes de tabelas e colunas totalmente em português.
- As tabelas incluem: `usuarios`, `contas`, `transferencias`, `depositos`, `pagamentos_pix`, `lancamentos`.

## 3. Configurar variáveis de ambiente

### API (packages/api/.env)
```env
PORT=3334
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=m3_bank
JWT_SECRET=m3-bank-secret
APP_TIMEZONE=America/Sao_Paulo
```

### Frontend (packages/web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3334/api
```

Para acessar o frontend por um dispositivo movel na mesma rede, troque `localhost`
pelo IP da maquina que esta rodando a API, por exemplo:

```env
NEXT_PUBLIC_API_URL=http://192.168.0.10:3334/api
```

## 4. Instalar dependências

Na raiz do projeto:
```bash
npm install
```

## 5. Popular o banco com dados iniciais

```bash
npm run seed
```

## 6. Executar as aplicações

### API (porta 3334):
```bash
npm run dev:api
```

### Frontend (porta 3000):
```bash
npm run dev:web
```

Ao iniciar o frontend, o terminal tambem exibira o link `Celular` para abrir em
outros dispositivos conectados ao mesmo Wi-Fi, por exemplo `http://192.168.0.10:3000`.

## URLs de acesso

- **Frontend:** http://localhost:3000
- **Frontend na rede local:** use o endereco `Celular` exibido pelo terminal
- **API REST:** http://localhost:3334/api
- **Swagger Docs:** http://localhost:3334/docs
- **GraphQL:** http://localhost:3334/graphql
- **Health Check:** http://localhost:3334/health

## Scripts disponíveis

```bash
npm run dev:api      # API em modo desenvolvimento
npm run dev:web      # Frontend em modo desenvolvimento
npm run seed         # Popular banco com dados de teste
npm run start:api    # API em modo produção
npm run start:web    # Frontend em modo produção
```

## Ordem recomendada para primeira execução

1. Criar banco `m3_bank` no MySQL
2. `npm install`
3. Configurar `packages/api/.env` e `packages/web/.env.local`
4. `npm run seed`
5. `npm run dev:api` (em um terminal)
6. `npm run dev:web` (em outro terminal)

## Limpeza do banco (se necessário)

Para resetar completamente o banco:
Entrar no banco (MySQL)
```sql
mysql -u root -p
DROP DATABASE m3_bank;
CREATE DATABASE m3_bank;
```
Depois execute `npm run seed` novamente.
USE m3_bank;

populando informações iniciais via script

```
