# 5. Testes Exploratórios (Test Charters - SBTM)

**M3 Bank** | **Session-Based Test Management**
**Baseado em:** John Bach (2001) + ISO 29119-3
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 - Júlio de Lima
**Última atualização:** 06/05/2026

---

## Introdução

Esta página organiza os testes exploratórios do M3 Bank em sessões SBTM. Cada sessão possui missão, escopo, ideias de teste, evidências esperadas e critério de encerramento.

O objetivo é complementar a automação com investigação manual, observação de riscos e coleta de evidências para apresentação e tomada de decisão.

---

## Como Executar as Sessões

Durante cada sessão, registre notas no formato:

- `(I)` Informação observada
- `(R)` Risco ou dúvida relevante
- `(B)` Bug/defeito encontrado
- `(Q)` Pergunta para PO/dev
- `(E)` Evidência coletada

Evidências recomendadas:
- Screenshot da tela relevante
- Vídeo curto quando houver fluxo ou comportamento intermitente
- Payload/resposta da API quando a investigação envolver contrato
- Link do ticket Jira correspondente
- Dados usados: e-mail, conta, horário, valor e ambiente

Ambiente base:
- Frontend: `http://localhost:3000`
- API: `http://localhost:3334/api`
- Swagger: `http://localhost:3334/docs`
- Banco: `m3_bank`

---

## Organização no Jira

Foram criadas subtarefas SBTM no projeto Jira `M3`, vinculadas às tarefas principais de RN01 a RN07.

| RN | Jira | Status inicial | Objetivo |
|----|------|----------------|----------|
| RN01 | [M3-40](https://marceloferreira.atlassian.net/browse/M3-40) | Tarefas pendentes | Cadastro - validações e resiliência de entrada |
| RN02 | [M3-41](https://marceloferreira.atlassian.net/browse/M3-41) | Tarefas pendentes | Login - autenticação, sessão e autorização |
| RN03 | [M3-42](https://marceloferreira.atlassian.net/browse/M3-42) | Tarefas pendentes | Transferências - core financeiro, token e limite noturno |
| RN04 | [M3-43](https://marceloferreira.atlassian.net/browse/M3-43) | Tarefas pendentes | Depósitos - crédito, limites e conta destino |
| RN05 | [M3-44](https://marceloferreira.atlassian.net/browse/M3-44) | Tarefas pendentes | Pix - pagamento simulado e registro no extrato |
| RN06 | [M3-45](https://marceloferreira.atlassian.net/browse/M3-45) | Tarefas pendentes | Extrato - saldo, filtros, sinais e movimentações |
| RN07 | [M3-46](https://marceloferreira.atlassian.net/browse/M3-46) | Tarefas pendentes | Perfil - nome, senha e feedback em tempo real |

Workflow disponível no Jira:
- `Tarefas pendentes`: charter pronto para executar
- `Em andamento`: sessão em execução/coleta de evidências
- `Concluído`: sessão finalizada, com evidências e notas anexadas

Labels aplicadas:
- `qa`
- `sbtm`
- `test-charter`
- `manual-test`
- `evidence`
- `RN01` a `RN07`

> Observação: o conector disponível permitiu criar subtarefas, labels e organizar o workflow existente. A criação de novas colunas no board não estava exposta via ferramenta MCP; por isso a organização foi feita usando os status já disponíveis e labels específicas de QA.

---

## Cronograma de Execução Sugerido

| Ordem | Sessão | Jira | Duração | Prioridade | Janela sugerida | Entrega |
|-------|--------|------|---------|------------|-----------------|---------|
| 1 | RN03 - Transferências | M3-42 | 60 min | Crítica | 09:00-10:00 | Evidências de token, limites, anti-fraude e limite noturno |
| 2 | RN02 - Login | M3-41 | 35 min | Alta | 10:10-10:45 | Evidências de sessão, erros e acesso sem token |
| 3 | RN01 - Cadastro | M3-40 | 35 min | Alta | 10:55-11:30 | Evidências de cadastro, campos e senha |
| 4 | RN04 - Depósitos | M3-43 | 40 min | Alta | 13:30-14:10 | Evidências de saldo, limites e conta destino |
| 5 | RN06 - Extrato | M3-45 | 45 min | Alta | 14:20-15:05 | Evidências de saldo, filtros, sinais e movimentações |
| 6 | RN07 - Perfil | M3-46 | 35 min | Média | 15:15-15:50 | Evidências de nome, senha e abas |
| 7 | RN05 - Pix | M3-44 | 30 min | Média | 16:00-16:30 | Evidências de QR Code, débito e extrato |
| 8 | Consolidação | Todos | 30 min | Alta | 16:40-17:10 | Atualizar notas, anexar evidências e abrir bugs se necessário |

Tempo total estimado: **5h10min**, incluindo consolidação.

---

## 5.1 Charter - Cadastro de Contas (RN01)

**Jira:** M3-40
**Duração sugerida:** 35 min
**Prioridade:** Alta
**RNs cobertas:** RN01.01 a RN01.07

> Explore **o cadastro de contas**
> Com **variações de campos obrigatórios, senha, confirmação, CPF, e-mail duplicado e saldo inicial**
> Para descobrir **falhas de validação, mensagens inconsistentes e problemas de experiência no primeiro acesso**

**Ideias de teste:**
- Campos vazios um a um e todos ao mesmo tempo.
- Senha com 5, 6 e 7 caracteres.
- Senha e confirmação divergentes.
- E-mail duplicado.
- E-mail inválido.
- CPF vazio ou formato inesperado.
- Toggle de saldo inicial ligado/desligado.
- Recarregar a página após cadastro e validar persistência da confirmação.

**Evidências esperadas:**
- Screenshot do cadastro bem-sucedido.
- Screenshot de pelo menos 2 mensagens de validação.
- Nota de dados usados: nome, e-mail, CPF e opção de saldo.

**Critério de encerramento:** RN01 foi observada manualmente em happy path, validações negativas e regra de saldo inicial.

---

## 5.2 Charter - Login e Autenticação (RN02)

**Jira:** M3-41
**Duração sugerida:** 35 min
**Prioridade:** Alta
**RNs cobertas:** RN02.01 a RN02.07

> Explore **o login e a gestão de sessão**
> Com **credenciais válidas, inválidas, campos vazios, navegação protegida e manipulação de sessão**
> Para descobrir **falhas de autenticação, autorização e mensagens de erro**

**Ideias de teste:**
- Login válido e redirecionamento para Home.
- Campos vazios.
- E-mail inexistente.
- Senha incorreta.
- Logout e botão voltar do navegador.
- Acesso direto a rotas protegidas sem sessão.
- Remover token do `localStorage` e navegar entre telas.

**Evidências esperadas:**
- Screenshot de login válido.
- Screenshot de erro de credenciais.
- Nota sobre comportamento sem token/localStorage.

**Critério de encerramento:** autenticação, bloqueios e rotas protegidas foram observados manualmente.

---

## 5.3 Charter - Transferências (RN03)

**Jira:** M3-42
**Duração sugerida:** 60 min
**Prioridade:** Crítica
**RNs cobertas:** RN03.01 a RN03.12

> Explore **o fluxo crítico de transferências**
> Com **contas diferentes, valores limite, saldo, token especial, horário noturno, lista de contas e anti-fraude**
> Para descobrir **riscos de integridade financeira, autorização, contrato e experiência de erro**

**Ideias de teste:**
- Transferência válida entre contas ativas.
- Valor abaixo de R$ 10,00 e exatamente R$ 10,00.
- Saldo insuficiente.
- Conta inexistente.
- Transferência para a própria conta.
- Valor acima de R$ 5.000,00 sem token, com token inválido e com token `123456`.
- Limite noturno acima de R$ 1.000,00.
- Lista de contas no header, seleção e autopreenchimento.
- Conferir saldo e extrato após sucesso e após falha.

**Focos especiais:**
- DEF-004: divergência de contrato `400` vs `401` em token inválido.
- DEF-005: instabilidade E2E headless no limite noturno.
- RN03.08: rollback ainda exige observação exploratória.

**Evidências esperadas:**
- Screenshot de transferência bem-sucedida.
- Screenshot do token especial.
- Screenshot ou vídeo do limite noturno.
- Nota de saldo antes/depois.
- Registro de status code se investigar via API/Swagger.

**Critério de encerramento:** RN03 foi exercitada em happy path, limites, autorização, anti-fraude, noturno e pós-condições financeiras.

---

## 5.4 Charter - Depósitos (RN04)

**Jira:** M3-43
**Duração sugerida:** 40 min
**Prioridade:** Alta
**RNs cobertas:** RN04.01 a RN04.08

> Explore **depósitos bancários**
> Com **valores próximos aos limites, conta destino, descrição e lista de contas**
> Para descobrir **falhas de crédito, validação, extrato e consistência de saldo**

**Ideias de teste:**
- Depósito válido.
- Valores R$ 9,99, R$ 10,00, R$ 10.000,00 e R$ 10.000,01.
- Conta inexistente.
- Campos numéricos com letras/caracteres especiais.
- Descrição vazia.
- Lista de contas no header e autopreenchimento.
- Conferir saldo e extrato após depósito.

**Evidências esperadas:**
- Screenshot de depósito bem-sucedido.
- Screenshot de validação de limite.
- Nota de saldo antes/depois.

**Critério de encerramento:** limites, crédito e registro financeiro foram observados manualmente.

---

## 5.5 Charter - Pix Simulado (RN05)

**Jira:** M3-44
**Duração sugerida:** 30 min
**Prioridade:** Média
**RNs cobertas:** RN05.01 a RN05.03

> Explore **o pagamento Pix simulado**
> Com **QR Code estático, valores válidos/inválidos, saldo e extrato**
> Para descobrir **falhas no débito, validação ou registro de saída**

**Ideias de teste:**
- Exibição do QR Code estático.
- Simular leitura com valor válido.
- Valor vazio, zero, negativo e acima do saldo.
- Informar descrição e conferir extrato.
- Confirmar que não há integração bancária real.

**Evidências esperadas:**
- Screenshot da tela Pix com QR Code.
- Screenshot de pagamento simulado.
- Screenshot do extrato com saída Pix.

**Critério de encerramento:** fluxo Pix foi validado do início até o registro financeiro.

---

## 5.6 Charter - Extrato e Saldo (RN06)

**Jira:** M3-45
**Duração sugerida:** 45 min
**Prioridade:** Alta
**RNs cobertas:** RN06.01 a RN06.07

> Explore **extrato, saldo e movimentações recentes**
> Com **dados gerados por cadastro, depósito, transferência e Pix**
> Para descobrir **falhas de atualização, paginação, filtros, sinais, cores e descrição**

**Ideias de teste:**
- Validar saldo atualizado após depósito, transferência e Pix.
- Conferir paginação e limite de itens.
- Testar filtros 7, 15 e 30 dias.
- Conferir débitos em vermelho com sinal negativo.
- Conferir créditos em verde.
- Verificar descrição ausente como hífen.
- Validar Home com movimentações recentes e conta relacionada.

**Evidências esperadas:**
- Screenshot do extrato com filtros.
- Screenshot de entradas e saídas com cores/sinais.
- Nota de comparação saldo antes/depois.

**Critério de encerramento:** visualização financeira foi validada com dados suficientes para leitura de extrato.

---

## 5.7 Charter - Perfil do Usuário (RN07)

**Jira:** M3-46
**Duração sugerida:** 35 min
**Prioridade:** Média
**RNs cobertas:** RN07.01 a RN07.07

> Explore **o gerenciamento de perfil**
> Com **alteração de nome, senha atual, nova senha, confirmação e navegação por abas**
> Para descobrir **falhas de validação, segurança e atualização em tempo real**

**Ideias de teste:**
- Alterar nome válido e conferir Home/header.
- Nome vazio.
- Nome com 1 caractere.
- Alterar senha com senha atual correta.
- Senha atual incorreta.
- Nova senha menor que 6 caracteres.
- Confirmação divergente.
- Navegar entre abas e observar estado dos campos.

**Evidências esperadas:**
- Screenshot de atualização de nome.
- Screenshot de validação de senha.
- Nota sobre atualização em tempo real.

**Critério de encerramento:** dados pessoais e segurança de senha foram explorados manualmente.

---

## 5.8 Consolidação das Sessões

Ao finalizar cada sessão:

- Mover o ticket Jira para `Concluído`.
- Anexar screenshots/vídeos no ticket.
- Registrar notas `(I)`, `(R)`, `(B)`, `(Q)` e `(E)`.
- Abrir bug separado para qualquer defeito reprodutível.
- Relacionar o bug à subtarefa SBTM correspondente.
- Atualizar esta wiki se a sessão mudar o entendimento de uma RN.

---

**Elaborado por:** Marcelo Ferreira
**Última atualização:** 06/05/2026
