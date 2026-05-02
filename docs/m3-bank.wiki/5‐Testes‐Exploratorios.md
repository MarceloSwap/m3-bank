# 5. Testes Exploratórios (Test Charters - SBTM)

**M3 Bank** | **Session-Based Test Management**
**Baseado em:** John Bach (2001) + ISO 29119-3
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 – Júlio de Lima
**Última atualização:** 02/05/2026

---

## Introdução

Sessões de testes exploratórios com duração fixa (30-60 min), guiadas por um **Test Charter** com missão clara.

Cada sessão entrega:
- Notas de sessão `(I) Informação` e `(R) Risco`
- Defeitos encontrados
- Perguntas e sugestões

---

## 5.1 Charter - Transferências (RN03)

**Data:** 28/04/2026 - 14:00 | **Duração:** 45 min

> Explore **a funcionalidade de Transferências**
> Com **contas de teste com diferentes saldos, horários diurno/noturno e tokens de autorização**
> Para descobrir **problemas relacionados a UI, limites, token de segurança, anti-fraude e rollback**

**Notas:**
- (I) Lista de contas ativas carrega corretamente e exclui a conta do usuário logado.
- (I) Campo de valor aceita números com vírgula e ponto.
- (I) Campo de token de autorização só aparece quando o valor ultrapassa R$ 5.000,00.
- (R) Comportamento do token não é consistente em todas as tentativas acima de R$ 5.000,00.
- (R) Limite noturno (20h-05h59) exige investigação adicional em execução headless.
- (I) Não há fluxo visível para colocar uma conta como inativa, o que limita a validação completa da RN03.01.

**Defeitos encontrados:**
- DEF-001 - Token de autorização não é solicitado consistentemente para valores > R$ 5.000,00.
- DEF-002 - Mensagem de erro do limite noturno não segue o padrão das demais mensagens.
- DEF-003 - Não é possível verificar conta inativa pelo frontend na RN03.01.

---

## 5.2 Charter - Autenticação e Segurança (RN02)

**Data:** 28/04/2026 - 15:00 | **Duração:** 30 min

> Explore **o fluxo de login e gestão de tokens**
> Com **diversas combinações de credenciais, tentativas falhas e tempo de expiração**
> Para descobrir **vulnerabilidades de segurança, mensagens de erro e comportamento do JWT**

**Notas:**
- (I) Mensagem para campos vazios: "Usuário e senha precisam ser preenchidos" - conforme RN02.01/RN02.05.
- (I) Sistema não diferencia "usuário inexistente" de "senha incorreta", o que reduz enumeração de usuários.
- (I) Rotas protegidas sem token retornam 401 nos testes de API.
- (R) Não foi testado comportamento com tokens adulterados.
- (R) Não há mecanismo de refresh token documentado.

**Defeitos encontrados:** Nenhum nesta sessão.

---

## 5.3 Charter - Depósitos (RN04)

**Data:** 29/04/2026 - 10:00 | **Duração:** 30 min

> Explore **a funcionalidade de Depósitos Bancários**
> Com **valores próximos aos limites, contas inválidas e descrições variadas**
> Para descobrir **problemas de validação, atualização de saldo e atomicidade da transação**

**Notas:**
- (I) Saldo atualiza imediatamente após depósito bem-sucedido.
- (I) Documentação consolidada define mínimo de R$ 10,00 e máximo de R$ 10.000,00.
- (R) Rollback de falha intermediária permanece com validação manual/exploratória.
- (R) Mensagem de erro para valor acima de R$ 10.000,00 deve manter o mesmo padrão visual das demais.

---

## 5.4 Charter - Auditoria de API (Swagger + VADER)

**Data:** 28/04/2026 - 14:00 | **Duração:** 60 min

> Explore **os contratos da API via Swagger e o código-fonte**
> Com **análise estática dos endpoints, schemas e regras de autorização**
> Para descobrir **divergências de contrato, exposição de dados e omissões de documentação**

**Notas:**
- (I) VADER cobre Verbs, Authorization, Data, Errors e Responsiveness.
- (I) Authorization está bem coberto em rotas sem token.
- (R) Há divergência de contrato na RN03: token inválido retorna 400 quando o teste espera 401.
- (R) Errors deve padronizar status code e schema `ErrorResponse` para cenários negativos.

---

## 5.5 Charter - Investigação RN03.10 Limite Noturno Headless

**Data:** 02/05/2026 | **Duração sugerida:** 45 min
**Tipo:** Investigação exploratória SBTM
**Alvo:** `TC-RN03-E2E-005` / RN03.10

> Explore **o fluxo de limite noturno na tela de transferências**
> Com **execução Cypress headless, `cy.clock()`, dados criados via API e variações de renderização/tempo**
> Para descobrir **por que o elemento esperado da UI não foi encontrado durante a execução automatizada**

**Foco da investigação:**
- Confirmar se `cy.clock()` é aplicado antes de qualquer lógica de horário usada pelo frontend.
- Verificar se a API usa horário real do servidor enquanto a UI usa relógio simulado do browser.
- Validar se o texto do erro aparece em modal, toast, inline alert ou resposta interceptada.
- Comparar execução headed vs headless para detectar diferença de timing, viewport ou animação.
- Inspecionar screenshot gerado em `packages/tests/ui/cypress/screenshots/RN03-transferencia.cy.js/`.
- Avaliar se o seletor atual depende de texto instável ou se precisa de `data-testid`.

**Hipóteses iniciais:**
- (R) O relógio simulado no browser não controla a regra de horário aplicada no backend.
- (R) O formulário pode exibir outro erro antes do limite noturno, impedindo o elemento esperado.
- (R) O texto pode estar correto, mas renderizado fora do tempo aguardado ou em outro componente.

**Critérios de encerramento:**
- Identificar se a falha é de seletor, timing, contrato UI/API ou regra de negócio.
- Registrar evidência com screenshot, vídeo ou log do Cypress.
- Propor correção sem criar novos testes, salvo aprovação explícita.

---

## 5.6 Próximos Charters Planejados

| Charter | Alvo | Missão |
|---------|------|--------|
| 5.7 | Anti-Fraude (RN03.09) | Explorar transferência para a própria conta e variações de número/dígito |
| 5.8 | Segurança JWT | Testar tokens adulterados, expirados e payload modificado |
| 5.9 | Rollback (RN03.08, RN04.07) | Simular falhas no meio da transação e verificar atomicidade |
| 5.10 | Gestão de dados de automação | Validar limpeza cirúrgica central ao final da suíte |

---

**Elaborado por:** Marcelo Ferreira
**Última atualização:** Maio de 2026
