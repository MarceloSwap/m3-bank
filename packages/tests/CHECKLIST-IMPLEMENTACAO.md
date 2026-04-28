### 3. `packages/tests/CHECKLIST-IMPLEMENTACAO.md`
```markdown
# ✅ Checklist de Implementação - M3 Bank

## 📋 Estrutura de Diretórios Criada
- [x] `packages/tests/api/` - Domínio Backend (Isolado)
- [x] `packages/tests/api/tests/` - Arquivos de teste Supertest
- [x] `packages/tests/api/docs/` - Wiki técnica da API
- [x] `packages/tests/ui/` - Domínio Frontend (Isolado)
- [x] `packages/tests/ui/e2e/` - Testes de jornada Cypress
- [x] `packages/tests/ui/docs/` - Wiki técnica de interface

---

## 🎯 Próximas Ações

### 1️⃣ **Validação do Ambiente**
```bash
cd packages/tests
npm install
npm run cleanup-qa  # Garante conexão com banco local
2️⃣ Implementação dos Cards Críticos
[ ] Card 1.1: Cadastro com Saldo (API + E2E)

[ ] Card 1.2: Login com Sucesso (API + E2E)

[ ] Card 1.3: Transferência Diurna (API + E2E)

3️⃣ Padrão de Nomenclatura
Arquivos: RN[XX]-[funcionalidade].spec.js.

Dados: Prefixo qa_ e domínio @test.com.

📊 Estrutura de um Teste Idempotente
Ao criar novos testes, certifique-se de:

Usar o padrão Arrange/Act/Assert.

Limpar a massa de dados específica no hook after() do teste de API.

Adicionar data-testid no frontend para garantir seletores estáveis.

🎓 Documentação de Referência
Guia do Framework: README.md

Estratégia VADER: CHARTER-API-VADER.md

Estratégia Boundary: CHARTER-UI-BOUNDARY.md