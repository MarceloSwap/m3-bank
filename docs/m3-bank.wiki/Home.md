# Bem-vindo ao Wiki do M3 Bank 🏦

**Projeto de Portfólio – Turma 2**
**Mentoria de Testes de Software – Júlio de Lima**

Este repositório é o **centro de documentação da qualidade** do M3 Bank.
O objetivo é demonstrar na prática o ciclo completo de **Testes de Software** em um sistema bancário.

---

## Objetivo do Projeto

- Aplicar análise de requisitos e User Stories
- Elaborar Estratégia, Plano e Casos de Teste (ISO 29119-3)
- Especificar comportamentos com BDD / Gherkin
- Executar testes manuais e exploratórios (SBTM)
- Reportar defeitos com evidências
- Desenvolver automação E2E (Cypress) e API (Supertest)
- Construir um portfólio profissional e completo

---

## Índice da Documentação

| # | Página | Descrição | Status |
|---|--------|-----------|--------|
| 1 | [Regras de Negócio](1‐Regras‐de‐Negocio) | Fonte da Verdade — RN01 a RN07 | ✅ |
| 2 | [Estratégia de Teste](2-Estrategia-de-Teste) | Stack técnica e Heurística VADER | ✅ |
| 3 | [Plano de Teste](3-Plano-de-Teste) | Cronograma, escopo e riscos | ✅ |
| 4 | [Casos de Teste](4-Casos-de-Teste) | Especificações ISO 29119-3 — RN01 a RN07 + VADER | ✅ |
| 5 | [Testes Exploratórios](5‐Testes‐Exploratorios) | Charters SBTM executados | ✅ |
| 6 | [Reporte de Defeitos](6-Reporte-de-Defeitos) | DEF-001 a DEF-005 | ✅ |
| 7 | [Relatórios de Execução](7-Relatorios-de-Execucao) | Métricas de pass/fail — API e E2E | ✅ |
| 8 | [User Stories](8-User-Stories) | US01 a US07 com critérios de aceite | ✅ |
| 9 | [BDD — Gherkin](9-BDD-Gherkin) | Especificações Dado/Quando/Então por módulo | ✅ |

---

## Dashboard de Automação

| Camada | Ferramenta | Testes | Status |
|--------|-----------|--------|--------|
| API REST — RN01–RN07 + VADER | Supertest + Mocha | 70 testes | 69 pass / 1 fail — 98,5% |
| E2E Web — RN01–RN07 | Cypress | 24 testes | 23 pass / 1 fail — 95,8% |
| **Total** | | **94 testes** | **92 pass / 2 fail — 97,9%** |

**Cobertura de RNs:** RN01 · RN02 · RN03 · RN04 · RN05 · RN06 · RN07
**Atenção:** RN03 está automatizada, mas parcialmente estabilizada por falha API `400` vs `401` e falha Cypress no limite noturno.
**Técnicas aplicadas:** Análise de Valor Limite · Particionamento de Equivalência · VADER · SBTM · BDD

---

## Estrutura de Automação

```
packages/tests/
  api/tests/
    rest/
      RN01-cadastro.spec.js        → 9 testes
      RN02-login.spec.js           → 11 testes
      RN03-transferencia.spec.js   → 9 testes
      RN04-deposito.spec.js        → 7 testes
      RN05-pix.spec.js             → 5 testes
      RN06-extrato.spec.js         → 8 testes
      RN07-perfil.spec.js          → 9 testes
      VADER-api.spec.js            → 12 testes
    bdd/
      RN01-cadastro.feature
      RN02-login.feature
      RN03-transferencia.feature
      RN04-deposito.feature
      RN05-pix.feature
      RN06-extrato.feature
      RN07-perfil.feature

  ui/cypress/e2e/
    RN01-cadastro.cy.js            → 4 testes
    RN02-login.cy.js               → 4 testes
    RN03-transferencia.cy.js       → 6 testes
    RN04-deposito.cy.js            → 3 testes
    RN05-pix.cy.js                 → 2 testes
    RN06-extrato.cy.js             → 2 testes
    RN07-perfil.cy.js              → 3 testes
```

---

## Comandos Principais

```bash
npm install
npm run seed
npm run dev:api
npm run dev:web
npm run test:api
npm run test:e2e
npm run cleanup:dry
npm run cleanup
```

**Documentação ISO 29119-3:** páginas [3. Plano de Teste](3-Plano-de-Teste), [4. Casos de Teste](4-Casos-de-Teste), [6. Reporte de Defeitos](6-Reporte-de-Defeitos) e [7. Relatórios de Execução](7-Relatorios-de-Execucao).

---

**Status do Projeto:** Automação RN01 a RN07 + VADER + BDD com falhas conhecidas em RN03
**Última atualização:** 02/05/2026
**Testador:** Marcelo Ferreira
