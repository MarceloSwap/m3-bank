# 7. Relatórios de Execução - Resultados e Métricas

**M3 Bank** | **Versão:** 4.0
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 – Júlio de Lima
**Última atualização:** 02/05/2026

---

## 7.1 Dashboard Consolidado

| Camada | Escopo | Testes | Pass | Fail | Taxa |
|--------|--------|-------:|-----:|-----:|------:|
| API - Mocha/Supertest | RN01-RN07 + VADER | 70 | 69 | 1 | 98,5% |
| E2E - Cypress | RN01-RN07 | 24 | 23 | 1 | 95,8% |
| **Total Geral** | **Automação funcional e resiliência** | **94** | **92** | **2** | **97,9%** |

**Falhas ativas:**
- API: `TC-RN03-API-07` esperava `401`, mas recebeu `400` ao validar token inválido em transferência acima de R$ 5.000,00.
- E2E: `TC-RN03-E2E-005` não encontrou o elemento esperado no fluxo de limite noturno durante execução headless.

---

## 7.2 Detalhamento API

| Suite | Testes | Pass | Fail | Taxa |
|-------|-------:|-----:|-----:|------:|
| RN01 - Cadastro de Contas | 9 | 9 | 0 | 100% |
| RN02 - Autenticação e Login | 11 | 11 | 0 | 100% |
| RN03 - Transferências | 9 | 8 | 1 | 88,9% |
| RN04 - Depósito Bancário | 7 | 7 | 0 | 100% |
| RN05 - Pagamentos Pix Simulado | 5 | 5 | 0 | 100% |
| RN06 - Extrato e Saldo | 8 | 8 | 0 | 100% |
| RN07 - Perfil do Usuário | 9 | 9 | 0 | 100% |
| VADER - Verbs | 2 | 2 | 0 | 100% |
| VADER - Authorization | 4 | 4 | 0 | 100% |
| VADER - Data | 2 | 2 | 0 | 100% |
| VADER - Errors | 3 | 3 | 0 | 100% |
| VADER - Responsiveness | 1 | 1 | 0 | 100% |
| **Total API** | **70** | **69** | **1** | **98,5%** |

---

## 7.3 Detalhamento E2E

| Suite | Testes | Pass | Fail | Taxa |
|-------|-------:|-----:|-----:|------:|
| RN01 - Cadastro | 4 | 4 | 0 | 100% |
| RN02 - Login | 4 | 4 | 0 | 100% |
| RN03 - Transferências | 6 | 5 | 1 | 83,3% |
| RN04 - Depósito | 3 | 3 | 0 | 100% |
| RN05 - Pix | 2 | 2 | 0 | 100% |
| RN06 - Extrato | 2 | 2 | 0 | 100% |
| RN07 - Perfil | 3 | 3 | 0 | 100% |
| **Total E2E** | **24** | **23** | **1** | **95,8%** |

---

## 7.4 Cobertura por Regra de Negócio

| RN | Módulo | Cobertura real | Status técnico |
|----|--------|----------------|----------------|
| RN01 | Cadastro | 100% | Coberta por API e E2E, com validações de campos, senha, e-mail e saldo inicial |
| RN02 | Login | 100% | Coberta por API e E2E, incluindo Authorization sem token |
| RN03 | Transferências | 90% | Coberta, mas com falha de contrato API e falha E2E no limite noturno |
| RN04 | Depósitos | 95% | Coberta por API e E2E; rollback permanece como risco exploratório |
| RN05 | Pix | 100% | Coberta por API e E2E |
| RN06 | Extrato e Saldo | 95% | Coberta por API e E2E; validações visuais finas permanecem complementares |
| RN07 | Perfil | 100% | Coberta por API e E2E |

---

## 7.5 Análise VADER

| Dimensão | Resultado | Análise |
|----------|-----------|---------|
| Verbs | 2/2 pass | Métodos HTTP indevidos estão protegidos dentro dos cenários auditados |
| Authorization | 4/4 pass na suíte VADER | Rotas sem token retornam 401, mas RN03 expôs divergência em token inválido: 400 vs 401 |
| Data | 2/2 pass | Payloads inválidos são rejeitados com 400 em cenários cobertos |
| Errors | 3/3 pass na suíte VADER | A suíte evita 500 e valida erros básicos, mas precisa alinhar status codes de negócio sensíveis |
| Responsiveness | 1/1 pass | Endpoint auditado respondeu dentro do SLA esperado |

**Leitura técnica:** a heurística VADER está saudável na suíte dedicada, mas a falha da RN03 mostra que Authorization e Errors precisam ser avaliados também dentro das regras de negócio, não apenas em rotas genéricas sem token.

---

## 7.6 Gestão e Sanitização de Dados

Estratégia recomendada para a próxima rodada:
- Manter dados de automação identificados por `qa_`, `QA `, `@test.com` e `@m3bank.test`.
- Executar `npm run cleanup:dry` antes de suites longas para visualizar o que será removido.
- Executar `npm run cleanup` ao final da suíte completa para limpar apenas dados gerados pela automação.
- Evitar limpeza agressiva com `TRUNCATE` ou reset total do banco, preservando dados exploratórios e manuais.

**Ponto de melhoria:** os testes API ainda possuem limpezas locais por spec. A padronização ideal é manter criação isolada por teste/spec e centralizar a limpeza cirúrgica no encerramento da suíte ou em uma etapa dedicada de pipeline.

---

## 7.7 Defeitos em Aberto

| ID | Módulo | Severidade | Impacto nos Testes |
|----|--------|------------|--------------------|
| DEF-001 | Transferências | Alta | Token especial inconsistente |
| DEF-002 | Transferências | Média | Mensagem limite noturno fora do padrão |
| DEF-003 | Transferências | Média | Conta inativa não validável pela UI |
| DEF-004 | API/RN03 | Média | Falha Mocha: `400` vs `401` |
| DEF-005 | E2E/RN03 | Média | Falha Cypress: elemento não encontrado no limite noturno |

Detalhes em [6. Reporte de Defeitos](6-Reporte-de-Defeitos).

---

**Elaborado por:** Marcelo Ferreira
**Última atualização:** Maio de 2026
