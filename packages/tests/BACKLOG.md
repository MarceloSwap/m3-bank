---

### 4. `packages/tests/BACKLOG.md`
```markdown
# 📋 Backlog de Testes - M3 Bank

**Estratégia:** Limpeza Cirúrgica (`qa_` + `@test.com`)  
**Filosofia:** Confiança Máxima com Mínimo Esforço

---

## 🔄 Fluxo 1: Cadastro → Login → Transferência → Extrato

### **Card 1.1: [RN02] Cadastro com Sucesso - Conta com Saldo**
- **Prioridade:** 🔴 CRÍTICA
- **Arquivos:** - `api/tests/RN02-cadastro.spec.js`
  - `ui/e2e/RN02-cadastro-com-saldo.spec.js`
- **Descrição:** Validar cadastro com criação automática de conta e saldo de R$ 1.000,00.

### **Card 1.2: [RN01] Login com Sucesso**
- **Prioridade:** 🔴 CRÍTICA
- **Arquivos:**
  - `api/tests/RN01-login.spec.js`
  - `ui/e2e/RN01-login-sucesso.spec.js`
- **Descrição:** Validar geração de Token JWT com expiração de 1 hora.

### **Card 1.3: [RN03] Transferência Diurna**
- **Prioridade:** 🔴 CRÍTICA
- **Arquivos:**
  - `api/tests/RN03-transferencia.spec.js`
  - `ui/e2e/RN03-transferencia-diurna.spec.js`
- **Descrição:** Validar débito/crédito entre contas com limite de R$ 10.000,00.

### **Card 1.4: [RN06] Extrato Completo**
- **Prioridade:** 🟡 ALTA
- **Arquivo:** `ui/e2e/RN06-extrato-visualizacao.spec.js`
- **Descrição:** Validar listagem de transações, cores de débito/crédito e paginação.

---

## 🔍 Testes Exploratórios (SBTM)

### **Charter 4.1: [SBTM] Riscos de API - Heurística VADER**
- **Arquivo:** `api/docs/CHARTER-API-VADER.md`
- **Foco:** **V**erbs, **A**uthorization, **D**ata, **E**rrors, **R**esponsiveness.

### **Charter 4.2: [SBTM] Riscos de UI - Boundary e Concorrência**
- **Arquivo:** `ui/docs/CHARTER-UI-BOUNDARY.md`
- **Foco:** Valores limite de transferência e cliques múltiplos em botões.