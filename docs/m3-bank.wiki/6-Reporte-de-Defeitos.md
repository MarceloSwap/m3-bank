# 6. Reporte de Defeitos

**M3 Bank** | **Registro de Defeitos / Bugs** | **Versão:** 2.0
**Data:** 02 de maio de 2026
**Testador:** Marcelo Ferreira
**Mentoria:** Turma 2 – Júlio de Lima
**Baseado em:** ISO/IEC/IEEE 29119-3 + Ferramentas de Gestão de Defeitos

---

## Introdução

Esta página centraliza os defeitos encontrados durante testes manuais, exploratórios e automatizados. Cada defeito registra comportamento esperado, comportamento atual, rastreabilidade e status.

**Status atual:** Em andamento, com dois defeitos ativos derivados da execução real de automação.

---

## Defeitos Registrados

### Defeito #001 - Token especial inconsistente em transferências acima de R$ 5.000,00

**Identificador:** DEF-001
**Título:** Token de autorização não é solicitado/validado de forma consistente para valores altos
**Origem:** Teste exploratório RN03
**Prioridade:** Alta
**Severidade:** Alta
**Rastreabilidade:** RN03.05, TC-RN03-API-06, TC-RN03-E2E-004
**Status:** Aberto

---

### Defeito #002 - Mensagem de limite noturno fora do padrão visual

**Identificador:** DEF-002
**Título:** Mensagem de erro do limite noturno não segue padrão das demais mensagens
**Origem:** Teste exploratório RN03
**Prioridade:** Média
**Severidade:** Média
**Rastreabilidade:** RN03.10, TC-RN03-E2E-005
**Status:** Aberto

---

### Defeito #003 - Conta inativa não validável pelo frontend

**Identificador:** DEF-003
**Título:** Não há caminho de UI para validar conta inativa em transferências
**Origem:** Teste exploratório RN03
**Prioridade:** Média
**Severidade:** Média
**Rastreabilidade:** RN03.01
**Status:** Aberto

---

### Defeito #004 - Erro de status code na API para token inválido

**Identificador:** DEF-004
**Título:** API retorna 400 em vez de 401 ao bloquear transferência acima de R$ 5.000 com token inválido

**Resultado Esperado:** Ao enviar token de autorização inválido em transferência acima de R$ 5.000,00, a API deve responder HTTP `401 Unauthorized`, mantendo consistência com a dimensão Authorization da heurística VADER.

**Resultado Atual:** O teste automatizado `TC-RN03-API-07` falhou porque a API retornou HTTP `400 Bad Request` quando a asserção esperava HTTP `401 Unauthorized`.

**Evidência:** Relatório Mocha/Mochawesome em `packages/tests/reports/api/api-report.json` com falha: `AssertionError: expected 400 to equal 401`.

**Prioridade:** Alta
**Severidade:** Média
**Ambiente:** Local, API porta 3334, Mocha/Supertest
**Rastreabilidade:**
- Caso de Teste: TC-RN03-API-07
- Regra de Negócio: RN03.05
- Heurística VADER: Authorization, Errors

**Status:** Aberto

---

### Defeito #005 - Erro de seletor no Cypress durante limite noturno

**Identificador:** DEF-005
**Título:** Cypress não encontra elemento esperado no fluxo de limite noturno em execução headless

**Resultado Esperado:** Ao simular horário noturno e transferir R$ 1.000,01, a UI deve exibir mensagem compatível com "Valor excede o limite noturno permitido" ou "limite noturno".

**Resultado Atual:** O cenário `TC-RN03-E2E-005` falhou em execução headless porque o Cypress não encontrou o elemento/texto esperado para a validação do limite noturno.

**Evidência:** Screenshot gerado em `packages/tests/ui/cypress/screenshots/RN03-transferencia.cy.js/` para o cenário `[TC-RN03-005] Transferencias - bloqueia valor acima do limite noturno`.

**Prioridade:** Alta
**Severidade:** Média
**Ambiente:** Local, Frontend porta 3000, Cypress headless
**Rastreabilidade:**
- Caso de Teste: TC-RN03-E2E-005
- Regra de Negócio: RN03.10
- Charter: 5.5 Investigação RN03.10 Limite Noturno Headless

**Status:** Aberto

---

## Observação sobre defeitos históricos

Os achados anteriores de Swagger/BOLA/IDOR permanecem como riscos documentais/exploratórios, mas a numeração desta página foi reorganizada para refletir os defeitos ativos usados na auditoria atual da automação.

---

## Template de Defeito (ISO 29119-3)

```markdown
### Defeito #[ID] - [Título breve]

**Identificador:** DEF-[ID]
**Título:** [Descrição clara]

**Resultado Esperado:** [Comportamento conforme RN]

**Resultado Atual:** [Comportamento observado]

**Prioridade:** [Alta / Média / Baixa]
**Severidade:** [Crítica / Alta / Média / Baixa]

**Rastreabilidade:**
- Caso de Teste: [ID]
- Regra de Negócio: [RN]

**Status:** Aberto
```
