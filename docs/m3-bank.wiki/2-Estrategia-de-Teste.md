# 2. Estratégia de Teste

**M3 Bank** **Estratégia de Teste** **Versão:** 1.1
**Data:** 28 de abril de 2026
**Testador:** Marcelo Ferreira
**Mentoria:** Turma 2 – Júlio de Lima

---

## Introdução

A Estratégia de Teste define **como** os testes serão realizados no M3 Bank.
Ela serve como guia técnico e metodológico para todas as atividades de teste, desde o planejamento até a automação.

**Objetivo principal:** Garantir cobertura eficiente, detecção precoce de defeitos e maximizar o valor entregue com os recursos disponíveis.

---

## 2.1 Abordagem Geral de Teste

- **Abordagem Híbrida**: Combinada entre **baseada em requisitos** (tradicional) e **exploratória** (SBTM).
- **Testes orientados a risco**: Módulo de **Transferências (RN03)** tem prioridade máxima por ser o core business.
- **Testes preventivos**: Início precoce na análise de requisitos, regras de negócio e auditoria de contratos (Swagger).
- **Testes exploratórios**: Sessões exploratórias para descobrir comportamentos inesperados.

**Níveis de Teste:**
1. **Testes de Integração / API** (foco principal)
2. **Testes E2E** (interface completa)
3. **Auditoria de Resiliência (Heurística VADER)**
4. Testes Exploratórios

### 2.1.1 Auditoria de API (Heurística VADER)
Além dos testes funcionais, a camada de API é submetida a uma rigorosa auditoria de resiliência utilizando a Heurística VADER para validar Requisitos Não-Funcionais e estabilidade:
* **V (Verbs):** Bloqueio de métodos HTTP não permitidos (404/405).
* **A (Authorization):** Segurança de tokens JWT e blindagem de rotas protegidas (401).
* **D (Data):** Contratos de dados, tipagem forte e payloads malformados (400).
* **E (Errors):** Garantia anti-500 (Internal Server Error) e conformidade com o Schema de erro documentado.
* **R (Responsiveness):** Monitoramento de SLAs de tempo de resposta dos endpoints (< 200ms).

---

## 2.2 Tipos de Testes

| Tipo de Teste              | Objetivo                                       | Ferramenta Principal     | Prioridade | Cobertura Alvo |
|----------------------------|------------------------------------------------|--------------------------|------------|----------------|
| Funcional                  | Validar regras de negócio                      | Cypress + Manual         | Alta       | 90%+           |
| Auditoria de API (VADER)   | Resiliência, Segurança e Contratos             | Supertest + Mocha        | Crítica    | 100% Endpoints |
| Não Funcional (básico)     | Segurança, limites, validações                 | Manual + Supertest       | Alta       | 80%            |
| Testes de API              | Validar endpoints do backend                   | Supertest                | Alta       | 85%            |
| E2E (End-to-End)           | Fluxos completos do usuário                    | Cypress                  | Alta       | 70%            |
| Exploratórios              | Descobrir riscos e comportamentos ocultos      | SBTM (Session-Based)     | Alta       | Contínuo       |
| Regressão                  | Garantir que correções não quebram             | Cypress (auto)           | Média      | 60%+           |
| Validação de Dados/Limites | Testar fronteiras e valores extremos           | Manual + Automatizado    | Alta       | 90%            |

---

## 2.3 Stack Técnica

### Ferramentas Utilizadas

| Camada              | Ferramenta               | Propósito                               |
|---------------------|--------------------------|-----------------------------------------|
| Automação E2E       | **Cypress** | Testes de interface e fluxos completos |
| Testes de API       | **Supertest** | Requisições HTTP e validações |
| Framework de Teste  | **Mocha** | Estrutura dos testes |
| Asserções           | **Chai** | Validações claras e legíveis |
| Relatórios          | **Mochawesome** | Dashboard visual de execução de API |
| Gestão de Testes    | GitHub Wiki + Markdown   | Documentação e rastreabilidade |
| Segurança           | **BCrypt** | Criptografia de senhas no BD |
| Infra de Teste      | **Dotenv (.env)** | Gestão de credenciais sensíveis e URLs  |

**Ambiente de Execução:**
- Local (Máquina Local / Windows)
- Banco de Dados: MySQL Local
- Navegador: Google Chrome
- Node.js + npm

---

## 2.4 Critérios de Risco e Priorização

**Riscos Principais Identificados:**
- Complexidade do módulo de Transferências (limites, token, horário noturno, rollback)
- Segurança da autenticação (BCrypt, JWT, brute force)
- Atomicidade das transações financeiras

**Matriz de Priorização (Atualizada):**

| Risco / Funcionalidade        | Impacto no Negócio | Probabilidade de Defeito | Prioridade de Teste |
|-------------------------------|--------------------|--------------------------|---------------------|
| Cadastro de Contas (RN01)     | Alto               | Alta                     | **Crítica** |
| Login e Autorização (RN02)    | Alto               | Média                    | Alta                |
| Transferências Diurnas (RN03) | Alto               | Alta                     | **Crítica** |
| Limite Noturno                | Alto               | Média                    | Alta                |
| Depósitos (RN04)              | Médio              | Baixa                    | Média               |

---

## 2.5 Cobertura de Testes

- **Cobertura por Requisitos**: Rastreabilidade entre RNs × Casos de Teste × Scripts Automatizados.
- **Criptografia e Segurança**: Garantia de que 100% das senhas em BD utilizam Hash seguro.
- **Isolamento de Credenciais**: Uso de `.env` para evitar exposição de senhas de banco em logs ou código.

---

## 2.6 Métricas de Sucesso da Estratégia

- Taxa de detecção de defeitos precoce (Shift-left na análise do Swagger).
- **98,5% de sucesso na suíte de API (Mocha)** na execução auditada: 69 pass / 1 fail.
- **95,8% de sucesso na suíte E2E (Cypress)** na execução auditada: 23 pass / 1 fail.
- Tempo médio de execução de regressão de API < 5 segundos.

---

**Referências:**
- [1. Regras de Negócio e Requisitos](../1-Regras-de-Negocio)
- [3. Plano de Teste](../3-Plano-de-Teste)
- [4. Casos de Teste](../4-Casos-de-Teste)

---

**Última atualização:** 02 de maio de 2026
**Elaborado por:** Marcelo Ferreira
