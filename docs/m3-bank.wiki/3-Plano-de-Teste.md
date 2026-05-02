# 3. Plano de Teste

**M3 Bank** | **ISO/IEC/IEEE 29119-3** | **Versão:** 2.0  
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 – Júlio de Lima

---

## 1. Introdução

### 1.1 Objetivo

Estabelecer o plano geral de testes para o M3 Bank, definindo escopo, abordagem, recursos, cronograma, riscos e critérios de aceite.

Foco principal: **Módulo de Transferências (RN03)** — core business com regras de limite, token de autorização, limite noturno e anti-fraude.

### 1.2 Referências

- [1. Regras de Negócio](1‐Regras‐de‐Negocio)
- [2. Estratégia de Teste](2-Estrategia-de-Teste)
- [4. Casos de Teste](4-Casos-de-Teste)
- [5. Testes Exploratórios](5‐Testes‐Exploratorios)

---

## 2. Escopo dos Testes

**Itens testados:**

| Módulo | RN | Tipo | Status |
|--------|----|------|--------|
| Cadastro de Contas | RN01 | Funcional + Limite + E2E | ✅ Concluído |
| Autenticação e Login | RN02 | Funcional + Segurança + E2E | ✅ Concluído |
| Transferências | RN03 | Funcional + Limite + Token + E2E | ✅ Concluído |
| Depósitos | RN04 | Funcional + Limite + E2E | ✅ Concluído |
| Pagamentos (Pix) | RN05 | Funcional + E2E | ✅ Concluído |
| Extrato e Saldo | RN06 | Funcional + Paginação + E2E | ✅ Concluído |
| Perfil do Usuário | RN07 | Funcional + Validação + E2E | ✅ Concluído |
| Auditoria VADER | AUDIT01 | Segurança + Contratos + SLA | ✅ Concluído |

**Fora do escopo:**
- Testes de performance/carga
- Testes de usabilidade aprofundados
- Integrações bancárias reais
- Testes de acessibilidade

---

## 3. Abordagem de Teste

- **Híbrida:** baseada em requisitos (ISO 29119-3) + exploratória (SBTM)
- **Orientada a risco:** Transferências com prioridade máxima
- **Técnicas aplicadas:**
  - Particionamento de Equivalência
  - Análise de Valor Limite (AVL) — RN01, RN03, RN04
  - Testes baseados em Risco
  - Heurística VADER (auditoria de API)
- **Ferramentas:** Cypress, Supertest + Mocha + Chai, Mochawesome

---

## 4. Recursos

- **Testador:** Marcelo Ferreira
- **Ambiente:** Local (Windows / localhost)
- **Banco de dados:** MySQL 8 local
- **Navegador:** Google Chrome
- **Node.js:** 18+

---

## 5. Cronograma

| Atividade | Período | Status |
|-----------|---------|--------|
| Análise de Requisitos | Concluída | ✅ |
| Plano de Teste | 20–27/04/2026 | ✅ |
| Casos de Teste (RN01–RN07) | 25/04–05/05/2026 | ✅ |
| Automação de API (Supertest) | 28/04–05/05/2026 | ✅ |
| Auditoria VADER | 28/04/2026 | ✅ |
| Automação E2E Cypress (RN01–RN07) | 05–20/05/2026 | ✅ |
| Testes Exploratórios (SBTM) | 28/04–15/05/2026 | ✅ |
| Reporte de Defeitos | Contínuo | ✅ |
| Relatório Final | 21–25/05/2026 | ✅ |

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Defeitos críticos em Transferências | Alta | Alta | Priorização + testes de limite, token e horário noturno |
| Vulnerabilidade BOLA/IDOR em /accounts | Alta | Crítica | DEF-004 registrado — aguarda correção |
| Limite noturno não validado na automação | Média | Média | Cenário documentado — requer controle de horário do sistema |
| Token de autorização inconsistente | Média | Alta | DEF-001 registrado — coberto nos testes E2E |

---

## 7. Critérios de Entrada e Saída

**Entry Criteria:**
- Regras de Negócio documentadas ✅
- Ambiente configurado e seed executado ✅
- Casos de Teste criados para todas as RNs ✅

**Exit Criteria:**
- 100% dos casos de Alta prioridade executados ✅
- Taxa de aprovação ≥ 95% (atual: 100%) ✅
- Todos os defeitos Alta/Crítica registrados com evidências ✅
- Relatório de execução publicado ✅

---

**Elaborado por:** Marcelo Ferreira  
**Última atualização:** Maio de 2026
