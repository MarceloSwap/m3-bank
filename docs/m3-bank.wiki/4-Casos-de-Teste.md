# 4. Casos de Teste

**M3 Bank** | **ISO/IEC/IEEE 29119-3** | **Versão:** 3.1
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 – Júlio de Lima
**Última atualização:** 02/05/2026

---

## Padrão de Nomenclatura

Todos os casos automatizados devem seguir o padrão:

`[TC-ID] [Funcionalidade] - [Cenário]`

Exemplos:
- `[TC-RN03-API-07] Transferências - bloqueia valor acima de R$ 5.000 com token inválido`
- `[TC-RN03-E2E-005] Transferências - bloqueia valor acima do limite noturno`

> Observação técnica: alguns scripts ainda usam o prefixo `CT-` no nome do teste. Para rastreabilidade da wiki, esses casos foram normalizados como `TC-`. Recomenda-se renomear os títulos dos testes em uma próxima rodada, sem criar novos testes, apenas padronizando a descrição.

---

## Tabela de Rastreabilidade Geral

| Módulo | RNs | Testes API | Testes E2E | Total automatizado | Status |
|--------|-----|-----------:|-----------:|-------------------:|--------|
| Cadastro de Contas | RN01 | 9 | 4 | 13 | Automatizado |
| Autenticação e Login | RN02 | 11 | 4 | 15 | Automatizado |
| Transferências | RN03 | 9 | 6 | 15 | Automatizado com falha conhecida |
| Depósitos | RN04 | 7 | 3 | 10 | Automatizado |
| Pagamentos Pix | RN05 | 5 | 2 | 7 | Automatizado |
| Extrato e Saldo | RN06 | 8 | 2 | 10 | Automatizado |
| Perfil do Usuário | RN07 | 9 | 3 | 12 | Automatizado |
| Auditoria VADER | AUDIT01 | 12 | — | 12 | Automatizado |
| **Total** | **RN01–RN07 + AUDIT01** | **70** | **24** | **94** | **92 pass / 2 fail** |

---

## 4.1 Cadastro de Contas (RN01)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN01-API-01 | Cadastro - cria conta com sucesso e saldo inicial de R$ 1.000,00 | API | RN01.02, RN01.06 | Automatizado |
| TC-RN01-API-02 | Cadastro - bloqueia nome vazio | API | RN01.01 | Automatizado |
| TC-RN01-API-03 | Cadastro - bloqueia e-mail vazio | API | RN01.01 | Automatizado |
| TC-RN01-API-04 | Cadastro - bloqueia senha vazia | API | RN01.01 | Automatizado |
| TC-RN01-API-05 | Cadastro - bloqueia CPF vazio | API | RN01.01 | Automatizado |
| TC-RN01-API-06 | Cadastro - bloqueia formato de e-mail inválido | API | RN01.02 | Automatizado |
| TC-RN01-API-07 | Cadastro - bloqueia senha com menos de 6 caracteres | API | RN01.04 | Automatizado |
| TC-RN01-API-08 | Cadastro - bloqueia senha e confirmação divergentes | API | RN01.05 | Automatizado |
| TC-RN01-API-09 | Cadastro - bloqueia e-mail já existente | API | RN01.03 | Automatizado |
| TC-RN01-E2E-001 | Cadastro - cria conta com sucesso via UI | E2E | RN01.02, RN01.06 | Automatizado |
| TC-RN01-E2E-002 | Cadastro - bloqueia senhas divergentes | E2E | RN01.05 | Automatizado |
| TC-RN01-E2E-003 | Cadastro - valida senha curta por análise de valor limite | E2E | RN01.04 | Automatizado |
| TC-RN01-E2E-004 | Cadastro - exige campos obrigatórios | E2E | RN01.01 | Automatizado |

---

## 4.2 Autenticação e Login (RN02)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN02-API-01 | Login - autentica com sucesso e retorna JWT | API | RN02.02, RN02.06 | Automatizado |
| TC-RN02-API-02 | Login - bloqueia e-mail e senha ausentes | API | RN02.01 | Automatizado |
| TC-RN02-API-03 | Login - bloqueia apenas e-mail preenchido | API | RN02.01 | Automatizado |
| TC-RN02-API-04 | Login - bloqueia apenas senha preenchida | API | RN02.01 | Automatizado |
| TC-RN02-API-05 | Login - rejeita e-mail não cadastrado | API | RN02.03 | Automatizado |
| TC-RN02-API-06 | Login - rejeita senha incorreta | API | RN02.04 | Automatizado |
| TC-RN02-API-07 | Autorização - bloqueia GET /accounts/me sem token | API | RN02.07 | Automatizado |
| TC-RN02-API-07b | Autorização - bloqueia GET /accounts/statement sem token | API | RN02.07 | Automatizado |
| TC-RN02-API-07c | Autorização - bloqueia POST /transfers sem token | API | RN02.07 | Automatizado |
| TC-RN02-API-07d | Autorização - bloqueia POST /deposits sem token | API | RN02.07 | Automatizado |
| TC-RN02-API-07e | Autorização - bloqueia POST /payments/pix/simulate sem token | API | RN02.07 | Automatizado |
| TC-RN02-E2E-001 | Login - autentica e armazena JWT no localStorage | E2E | RN02.02, RN02.06 | Automatizado |
| TC-RN02-E2E-002 | Login - rejeita e-mail não cadastrado | E2E | RN02.03 | Automatizado |
| TC-RN02-E2E-003 | Login - rejeita senha incorreta | E2E | RN02.04 | Automatizado |
| TC-RN02-E2E-004 | Login - exige campos obrigatórios | E2E | RN02.01, RN02.05 | Automatizado |

---

## 4.3 Transferências (RN03)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN03-API-01 | Transferências - realiza transferência com sucesso | API | RN03.01, RN03.07 | Automatizado |
| TC-RN03-API-02 | Transferências - bloqueia valor abaixo de R$ 10,00 | API | RN03.04 | Automatizado |
| TC-RN03-API-03 | Transferências - bloqueia saldo insuficiente | API | RN03.06 | Automatizado |
| TC-RN03-API-04 | Transferências - bloqueia conta inexistente | API | RN03.01 | Automatizado |
| TC-RN03-API-05 | Transferências - bloqueia transferência para a própria conta | API | RN03.09 | Automatizado |
| TC-RN03-API-06 | Transferências - exige token para valor acima de R$ 5.000,00 | API | RN03.05 | Automatizado |
| TC-RN03-API-07 | Transferências - bloqueia valor acima de R$ 5.000 com token inválido | API | RN03.05 | Automatizado com falha: esperado 401, retornou 400 |
| TC-RN03-API-08 | Transferências - bloqueia limite noturno acima de R$ 1.000,00 | API | RN03.10 | Automatizado |
| TC-RN03-API-09 | Transferências - valida contrato de erro em cenário negativo | API | RN03.05, RN03.10 | Automatizado |
| TC-RN03-E2E-001 | Transferências - realiza transferência manual com sucesso | E2E | RN03.01, RN03.07 | Automatizado |
| TC-RN03-E2E-002 | Transferências - aplica AVL para R$ 9,99 e R$ 10,00 | E2E | RN03.04 | Automatizado |
| TC-RN03-E2E-003 | Transferências - seleciona conta na lista e preenche destino | E2E | RN03.11, RN03.12 | Automatizado |
| TC-RN03-E2E-004 | Transferências - exige token para valor acima de R$ 5.000,00 | E2E | RN03.05 | Automatizado |
| TC-RN03-E2E-005 | Transferências - bloqueia valor acima do limite noturno | E2E | RN03.10 | Automatizado com falha: seletor/elemento não encontrado no headless |
| TC-RN03-E2E-006 | Transferências - bloqueia transferência para a própria conta | E2E | RN03.09 | Automatizado |

**Cobertura RN03:** 90% operacional. A regra está automatizada em API e E2E, mas há uma falha de contrato na autorização especial (`400` vs `401`) e uma falha de estabilidade no E2E headless do limite noturno.

---

## 4.4 Depósitos (RN04)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN04-API-01 | Depósitos - realiza depósito com sucesso | API | RN04.01, RN04.05, RN04.06 | Automatizado |
| TC-RN04-API-02 | Depósitos - bloqueia valor abaixo de R$ 10,00 | API | RN04.04 | Automatizado |
| TC-RN04-API-03 | Depósitos - bloqueia valor acima de R$ 10.000,00 | API | RN04.04 | Automatizado |
| TC-RN04-API-04 | Depósitos - bloqueia conta inexistente | API | RN04.01 | Automatizado |
| TC-RN04-API-05 | Depósitos - exige token JWT | API | RN04.01 | Automatizado |
| TC-RN04-API-06 | Depósitos - valida campos obrigatórios | API | RN04.02, RN04.03 | Automatizado |
| TC-RN04-API-07 | Depósitos - valida schema de erro | API | RN04.04 | Automatizado |
| TC-RN04-E2E-001 | Depósitos - realiza depósito com sucesso via UI | E2E | RN04.01, RN04.06 | Automatizado |
| TC-RN04-E2E-002 | Depósitos - aplica AVL em valores mínimo e máximo | E2E | RN04.04 | Automatizado |
| TC-RN04-E2E-003 | Depósitos - seleciona conta na lista e preenche destino | E2E | RN04.08 | Automatizado |

---

## 4.5 Pagamentos Pix Simulado (RN05)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN05-API-01 | Pix - simula pagamento com sucesso | API | RN05.02, RN05.03 | Automatizado |
| TC-RN05-API-02 | Pix - bloqueia requisição sem token | API | RN05.03 | Automatizado |
| TC-RN05-API-03 | Pix - bloqueia valor inválido | API | RN05.03 | Automatizado |
| TC-RN05-API-04 | Pix - bloqueia saldo insuficiente | API | RN05.03 | Automatizado |
| TC-RN05-API-05 | Pix - valida schema de resposta | API | RN05.03 | Automatizado |
| TC-RN05-E2E-001 | Pix - exibe QR Code estático e simula pagamento | E2E | RN05.01, RN05.02 | Automatizado |
| TC-RN05-E2E-002 | Pix - registra saída no extrato após simulação | E2E | RN05.03, RN06.04 | Automatizado |

---

## 4.6 Extrato e Saldo (RN06)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN06-API-01 | Extrato - retorna saldo e lançamentos paginados | API | RN06.01, RN06.02 | Automatizado |
| TC-RN06-API-02 | Extrato - aplica paginação | API | RN06.02 | Automatizado |
| TC-RN06-API-03 | Extrato - aplica filtros de período | API | RN06.06 | Automatizado |
| TC-RN06-API-04 | Extrato - normaliza período inválido | API | RN06.06 | Automatizado |
| TC-RN06-API-05 | Extrato - retorna schema obrigatório dos lançamentos | API | RN06.03, RN06.05 | Automatizado |
| TC-RN06-API-06 | Extrato - bloqueia acesso ao extrato sem token | API | RN06.02 | Automatizado |
| TC-RN06-API-07 | Extrato - bloqueia acesso à conta autenticada sem token | API | RN06.01 | Automatizado |
| TC-RN06-API-08 | Extrato - retorna dados completos da conta autenticada | API | RN06.01 | Automatizado |
| TC-RN06-E2E-001 | Extrato - exibe saldo, paginação e filtros rápidos | E2E | RN06.01, RN06.06 | Automatizado |
| TC-RN06-E2E-002 | Home - exibe movimentações recentes com descrição | E2E | RN06.07 | Automatizado |

---

## 4.7 Perfil do Usuário (RN07)

| TC-ID | Funcionalidade - Cenário | Camada | RN | Status |
|-------|---------------------------|--------|----|--------|
| TC-RN07-API-01 | Perfil - retorna dados da conta autenticada | API | RN07.01 | Automatizado |
| TC-RN07-API-02 | Perfil - atualiza nome com sucesso | API | RN07.01, RN07.06 | Automatizado |
| TC-RN07-API-03 | Perfil - altera senha com sucesso | API | RN07.03, RN07.04, RN07.06 | Automatizado |
| TC-RN07-API-04 | Perfil - bloqueia nome vazio | API | RN07.02 | Automatizado |
| TC-RN07-API-05 | Perfil - bloqueia nome abaixo do mínimo | API | RN07.02 | Automatizado |
| TC-RN07-API-06 | Perfil - bloqueia senha atual incorreta | API | RN07.03, RN07.05 | Automatizado |
| TC-RN07-API-07 | Perfil - bloqueia nova senha abaixo do mínimo | API | RN07.04 | Automatizado |
| TC-RN07-API-08 | Perfil - bloqueia alteração de senha sem senha atual | API | RN07.03 | Automatizado |
| TC-RN07-API-09 | Perfil - bloqueia atualização sem token | API | RN07.01 | Automatizado |
| TC-RN07-E2E-001 | Perfil - atualiza nome e reflete na Home | E2E | RN07.01, RN07.06 | Automatizado |
| TC-RN07-E2E-002 | Perfil - valida nome mínimo de 2 caracteres | E2E | RN07.02 | Automatizado |
| TC-RN07-E2E-003 | Perfil - altera senha e bloqueia confirmação divergente | E2E | RN07.03, RN07.04 | Automatizado |

---

## 4.8 Auditoria de API - Heurística VADER (AUDIT01)

| TC-ID | Funcionalidade - Cenário | Dimensão | Status |
|-------|---------------------------|----------|--------|
| TC-VADER-V-01 | API - bloqueia método HTTP indevido em rota de login | Verbs | Automatizado |
| TC-VADER-V-02 | API - bloqueia método HTTP indevido em perfil | Verbs | Automatizado |
| TC-VADER-A-01 | API - bloqueia PUT /auth/profile sem token | Authorization | Automatizado |
| TC-VADER-A-02 | API - bloqueia GET /accounts/me sem token | Authorization | Automatizado |
| TC-VADER-A-03 | API - bloqueia GET /accounts/statement sem token | Authorization | Automatizado |
| TC-VADER-A-04 | API - bloqueia POST /transfers sem token | Authorization | Automatizado |
| TC-VADER-D-01 | API - rejeita payload vazio em transferências | Data | Automatizado |
| TC-VADER-D-02 | API - rejeita amount string em Pix | Data | Automatizado |
| TC-VADER-E-01 | API - retorna 401 para credenciais inválidas | Errors | Automatizado |
| TC-VADER-E-02 | API - retorna 400 para senha atual incorreta | Errors | Automatizado |
| TC-VADER-E-03 | API - garante anti-500 em dados inválidos | Errors | Automatizado |
| TC-VADER-R-01 | API - responde GET /accounts/me abaixo do SLA | Responsiveness | Automatizado |

---

**Elaborado por:** Marcelo Ferreira
**Baseado em:** ISO/IEC/IEEE 29119-3
