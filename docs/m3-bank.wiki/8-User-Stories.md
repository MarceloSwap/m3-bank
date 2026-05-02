# 8. User Stories

**M3 Bank** | **Versão:** 1.1
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 – Júlio de Lima

---

## Introdução

As User Stories descrevem as funcionalidades do M3 Bank do ponto de vista do usuário final.
Cada história segue o formato padrão **"Como… Quero… Para…"** e está rastreada às Regras de Negócio (RNs) e Casos de Teste (CTs).

**Critérios de Aceite** seguem o padrão **Given / When / Then (BDD)** — detalhados na página [9. BDD — Especificações Gherkin](9-BDD-Gherkin).

---

## US01 — Cadastro de Conta

**Como** um novo usuário,
**Quero** criar uma conta no M3 Bank informando nome, e-mail, CPF e senha,
**Para** ter acesso aos serviços financeiros da plataforma.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN01.01, RN01.02, RN01.03, RN01.04, RN01.05, RN01.06, RN01.07 |
| Prioridade | Alta |
| Status | ✅ Automatizado (API + E2E) |

**Critérios de Aceite:**
- Todos os campos (Nome, E-mail, CPF, Senha, Confirmar Senha) são obrigatórios.
- Senhas divergentes bloqueiam o cadastro com mensagem clara.
- Senha com menos de 6 caracteres é rejeitada.
- E-mail duplicado retorna erro 400 com mensagem "E-mail já cadastrado".
- Com o toggle "Criar conta com saldo" ativo, a conta inicia com R$ 1.000,00.
- O número da conta criada é exibido na tela de confirmação.

---

## US02 — Login e Acesso ao Dashboard

**Como** um usuário cadastrado,
**Quero** fazer login com meu e-mail e senha,
**Para** acessar minha conta e realizar operações financeiras.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN02.01, RN02.02, RN02.03, RN02.04, RN02.05, RN02.06 |
| Prioridade | Alta |
| Status | ✅ Automatizado (API + E2E) |

**Critérios de Aceite:**
- Campos vazios exibem: "Usuário e senha precisam ser preenchidos".
- Credenciais inválidas exibem mensagem de erro sem revelar se o e-mail existe.
- Login bem-sucedido redireciona para a Home e armazena JWT no localStorage.
- Token JWT expira em 1 hora — requisições com token expirado retornam 401.
- Rotas protegidas sem token retornam 401 com schema `ErrorResponse`.

---

## US03 — Transferência Bancária

**Como** um usuário autenticado,
**Quero** transferir valores para outras contas ativas,
**Para** movimentar meu dinheiro de forma segura e rastreável.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN03.01 a RN03.12 |
| Prioridade | Crítica |
| Status | Automatizado (API + E2E) com falha conhecida em RN03.05/RN03.10 |

**Critérios de Aceite:**
- Valor mínimo: R$ 10,00. Abaixo disso, exibe mensagem de limite mínimo.
- Conta de destino deve existir e estar ativa. Caso contrário: "Conta inválida ou inexistente".
- Transferência para a própria conta é bloqueada: "Não é possível transferir para a própria conta".
- Valores acima de R$ 5.000,00 exigem token de autorização `123456`.
- **Limite diurno (06h–19h59):** máximo de R$ 10.000,00 por transação.
- **Limite noturno (20h–05h59):** máximo de R$ 1.000,00. Acima disso: "Valor excede o limite noturno permitido".
- Sucesso exibe modal de confirmação, debita o saldo em tempo real e redireciona para o Extrato.
- Em caso de falha, a transação é completamente revertida (Rollback).
- A lista de contas disponíveis exclui automaticamente a conta do usuário logado.

**Observação de auditoria:** RN03 está coberta pela automação, mas permanece com dois pontos em aberto: contrato API `400` vs `401` para token inválido e instabilidade E2E headless no limite noturno.

---

## US04 — Depósito Bancário

**Como** um usuário autenticado,
**Quero** depositar valores em contas ativas,
**Para** creditar saldo imediatamente em qualquer conta do banco.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN04.01 a RN04.08 |
| Prioridade | Média |
| Status | ✅ Automatizado (API + E2E) |

**Critérios de Aceite:**
- Valor mínimo: R$ 10,00. Valor máximo: R$ 10.000,00.
- Conta de destino deve existir e estar ativa.
- Saldo é creditado imediatamente após o depósito.
- Sucesso exibe mensagem de confirmação e registra no extrato como "Depósito".
- Em caso de falha, a operação é completamente revertida (Rollback).

---

## US05 — Pagamento via Pix Simulado

**Como** um usuário autenticado,
**Quero** simular um pagamento via Pix,
**Para** testar o fluxo de débito e verificar o registro no extrato.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN05.01, RN05.02, RN05.03 |
| Prioridade | Média |
| Status | ✅ Automatizado (API + E2E) |

**Critérios de Aceite:**
- A tela exibe um QR Code estático (mockado).
- O usuário informa valor e descrição e clica em "Simular Leitura".
- O sistema valida saldo, debita o valor e registra saída no extrato.
- Nenhuma integração bancária real é realizada.

---

## US06 — Visualização de Extrato e Saldo

**Como** um usuário autenticado,
**Quero** visualizar meu extrato e saldo atualizado,
**Para** acompanhar minha movimentação financeira.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN06.01 a RN06.07 |
| Prioridade | Média |
| Status | ✅ Automatizado (API + E2E) |

**Critérios de Aceite:**
- Saldo disponível é exibido atualizado no momento do acesso.
- Extrato é paginado (limite de itens por página).
- Filtros rápidos disponíveis: "Últimos 7 dias", "Últimos 15 dias", "Últimos 30 dias".
- Valores de saída (débito) aparecem em **vermelho** com prefixo `(−)`.
- Valores de entrada (crédito) aparecem em **verde**.
- Transações sem descrição exibem `−` no campo de descrição.
- A Home exibe movimentações recentes com descrição e número de conta quando disponível.

---

## US07 — Gerenciamento de Perfil

**Como** um usuário autenticado,
**Quero** alterar meu nome e senha,
**Para** manter meus dados pessoais atualizados e minha conta segura.

| Campo | Detalhe |
|-------|---------|
| RNs rastreadas | RN07.01 a RN07.07 |
| Prioridade | Média |
| Status | ✅ Automatizado (API + E2E) |

**Critérios de Aceite:**
- A tela de perfil é organizada em abas: "Alterar Nome" e "Alterar Senha".
- Nome deve ter no mínimo 2 caracteres. Campo vazio é bloqueado.
- Alteração de senha exige a senha atual para confirmação.
- Nova senha deve ter mínimo 6 caracteres e ser confirmada em campo separado.
- Senha atual incorreta retorna erro 400 com mensagem "Senha atual incorreta".
- Sucesso exibe mensagem de confirmação e atualiza os dados em tempo real.

---

## Matriz de Rastreabilidade — User Stories × RNs × Automação

| US | Módulo | RNs | API | E2E | BDD |
|----|--------|-----|-----|-----|-----|
| US | Módulo | RNs | API | E2E | BDD | Status |
|----|--------|-----|-----|-----|-----|--------|
| US01 | Cadastro | RN01.01–07 | 9 testes | 4 testes | Feature | Coberta |
| US02 | Login | RN02.01–07 | 11 testes | 4 testes | Feature | Coberta |
| US03 | Transferências | RN03.01–12 | 9 testes | 6 testes | Feature | Coberta com falhas conhecidas |
| US04 | Depósitos | RN04.01–08 | 7 testes | 3 testes | Feature | Coberta |
| US05 | Pix | RN05.01–03 | 5 testes | 2 testes | Feature | Coberta |
| US06 | Extrato | RN06.01–07 | 8 testes | 2 testes | Feature | Coberta |
| US07 | Perfil | RN07.01–07 | 9 testes | 3 testes | Feature | Coberta |

---

## Auditoria de Critérios de Aceite

| RN | Resultado | Observação |
|----|-----------|------------|
| RN01 | Coberta | Campos obrigatórios, senha, duplicidade e saldo inicial automatizados |
| RN02 | Coberta | Login, credenciais inválidas e rotas sem token automatizados |
| RN03 | Parcialmente estabilizada | Critérios cobertos, mas RN03.05 e RN03.10 têm falhas abertas |
| RN04 | Coberta | Limites, conta destino e depósito com sucesso automatizados; rollback segue exploratório |
| RN05 | Coberta | QR/Pix simulado, débito e registro em extrato cobertos |
| RN06 | Coberta | Saldo, extrato, paginação/filtros e home cobertos |
| RN07 | Coberta | Nome, senha atual, nova senha e UI por abas cobertos |

---

**Elaborado por:** Marcelo Ferreira
**Última atualização:** 02/05/2026
