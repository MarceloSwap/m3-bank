# 📖 Gestão de Dados de Teste - M3 Bank

## Estratégia de Limpeza Cirúrgica vs. Reset Total

### 🎯 Visão Geral

O M3 Bank adota uma **estratégia de limpeza cirúrgica** em vez de um reset total do banco de dados. Esta abordagem foi desenhada para suportar **Testes Exploratórios (SBTM)** simultâneos com automação, mantendo um ambiente realista e confiável.

---

## ❌ Por Que NÃO Usamos Reset Total?

### **Reset Total (Abordagem Tradicional)**
```sql
-- ❌ Perigoso em ambiente compartilhado
DELETE FROM lancamentos;
DELETE FROM pagamentos_pix;
DELETE FROM depositos;
DELETE FROM transferencias;
DELETE FROM contas;
DELETE FROM usuarios;
```

**Problemas:**
1. **Apaga dados de testes exploratórios manuais** - Um QA testando manualmente perde todos os dados quando a automação executa
2. **Sem isolamento de dados** - Automação e testes manuais competem pelos mesmos registros
3. **Banco fica vazio e irreal** - Cenários realistas (extrato com 100 transações) não são possíveis
4. **Falta rastreabilidade** - Impossível identificar qual teste criou qual registro
5. **Requer sincronização rigorosa** - Ninguém pode testar enquanto automação executa

---

## ✅ Limpeza Cirúrgica (Nossa Abordagem)

```javascript
// ✅ Limpeza seletiva - remove APENAS dados de teste automático
DELETE FROM usuarios 
WHERE nome LIKE 'qa_%' OR email LIKE '%@test.com';
```

**Vantagens:**
1. **Isolamento automático/manual** - Dados de testes manuais são preservados
2. **Coexistência pacífica** - QA manual testa enquanto automação executa
3. **Ambiente realista** - Banco sempre tem dados, não fica vazio
4. **Rastreabilidade** - Registros QA sempre começam com `qa_`
5. **Sem sincronização** - Execução contínua sem bloqueios

---

## 🔖 Convenção de Nomenclatura

### **Prefixo QA_**

Todos os dados criados pela automação **devem usar o prefixo `qa_`**:

```javascript
// ✅ Correto - será limpo automaticamente
{
  name: 'qa_usuario_transferencia_001',
  email: 'qa_usuario_transferencia_001@test.com',
  password: 'Senha@123456'
}

// ❌ Incorreto - NÃO será limpo
{
  name: 'usuario_transferencia_001',
  email: 'usuario_transferencia_001@test.com',
  password: 'Senha@123456'
}
```

### **Domínio de Teste @test.com**

Como camada adicional de segurança, qualquer e-mail terminando em `@test.com` é **considerado teste**:

```javascript
// ✅ Seguro - será limpo mesmo sem prefixo qa_
{
  name: 'Fulano Silva',
  email: 'fulano@test.com'  // @test.com = dados de teste
}

// ❌ Não será limpo (e-mail normal)
{
  name: 'Fulano Silva',
  email: 'fulano@example.com'
}
```

---

## 🧹 Como Funciona cleanup-tests.js

### **Script de Limpeza Cirúrgica**

Localizado em: `packages/tests/scripts/cleanup-tests.js`

**Fluxo de Execução:**

1. **Identifica usuários QA**
   ```sql
   SELECT id FROM usuarios 
   WHERE nome LIKE 'qa_%' OR email LIKE '%@test.com'
   ```

2. **Encontra contas associadas**
   ```sql
   SELECT id FROM contas WHERE usuario_id IN (...)
   ```

3. **Deleta transações em cascata** (sem deixar órfãs)
   - Transferências (origem ou destino)
   - Depósitos
   - Pagamentos PIX
   - Lançamentos (extratos)

4. **Deleta contas**
   ```sql
   DELETE FROM contas WHERE id IN (...)
   ```

5. **Deleta usuários**
   ```sql
   DELETE FROM usuarios WHERE id IN (...)
   ```

**Importante:** Cada operação é realizada dentro de uma **transação (BEGIN/COMMIT)** para garantir consistência. Se algo der errado, tudo é revertido (ROLLBACK).

### **Executando a Limpeza**

```bash
# Na raiz do workspace tests
cd packages/tests

# Executar limpeza
npm run cleanup-qa

# Saída esperada:
# 🧹 Iniciando limpeza cirúrgica de dados de teste...
# 📋 Procurando usuários com prefixo "qa_" ou domínio "@test.com"...
#    Encontrados 5 usuários de teste
# 📋 Procurando contas associadas aos usuários de teste...
#    Encontradas 5 contas de teste
# 🗑️ Deletando transações de teste...
#    ✓ 15 transferências deletadas
#    ✓ 3 depósitos deletados
#    ✓ 2 pagamentos deletados
#    ✓ 20 lançamentos deletados
# 🗑️ Deletando contas de teste...
#    ✓ 5 contas deletadas
# 🗑️ Deletando usuários de teste...
#    ✓ 5 usuários deletados
# ✅ Limpeza cirúrgica concluída com sucesso!
```

---

## 🛠️ Integração com Pipeline CI/CD

### **Antes de Cada Suíte de Testes**

```bash
#!/bin/bash

# 1. Limpar dados automáticos anteriores
npm --workspace packages/tests run cleanup-qa

# 2. (Opcional) Recriar estrutura se necessário
# npm --workspace packages/api run seed

# 3. Executar testes
npm --workspace packages/tests run test:api
npm --workspace packages/tests run test:e2e
```

### **Benefícios em CI/CD**

- ✅ **Testes idempotentes** - Podem executar múltiplas vezes
- ✅ **Ambiente previsível** - Sem "lixo" de execuções anteriores
- ✅ **Dados reais** - Testes manuais continuam intactos
- ✅ **Rastreamento** - Logs mostram exatamente o que foi limpo

---

## 📊 Exemplo Prático: Cenário Misto

### **Cenário: Automação + Testes Manuais Simultâneos**

**Quarta-feira, 9h:**

```
Estado do Banco (antes de qualquer coisa):
├── usuario: "qa_user_001" (criado por automação ontem)
├── usuario: "João Silva" (criado manualmente para teste)
└── usuario: "qa_user_002" (criado por automação ontem)
```

**Quarta-feira, 10h:**
- QA Manual começa a testar com "João Silva"
- Pipeline CI executa `npm run cleanup-qa`

```sql
-- Apenas isso é deletado:
DELETE FROM usuarios WHERE nome LIKE 'qa_%' OR email LIKE '%@test.com'
-- Resultado: qa_user_001 e qa_user_002 deletados
-- João Silva continua intacto ✅
```

**Quarta-feira, 10h30:**
- Automação cria novos usuários: qa_user_003, qa_user_004
- QA Manual continua testando com "João Silva"
- Ambos trabalham no mesmo banco sem conflitos ✅

**Quinta-feira, 9h:**
- Novo ciclo de testes
- `npm run cleanup-qa` remove qa_user_003 e qa_user_004
- Novos usuários QA são criados
- Dados manuais de "João Silva" permanecem para futuras sessões

---

## 🔒 Segurança e Conformidade

### **Proteção contra Acidentes**

1. **Validação de Prefixo**
   ```javascript
   // Script verifica E garante que está deletando apenas qa_
   const isQAUser = user.nome.startsWith('qa_') || 
                    user.email.endsWith('@test.com');
   ```

2. **Transações Atômicas**
   ```javascript
   await connection.beginTransaction();
   // ... múltiplas deletes
   await connection.commit(); // Tudo ou nada
   ```

3. **Logs Detalhados**
   ```
   📋 Procurando usuários...
   ✓ 5 transferências deletadas
   ✓ 3 depósitos deletados
   ```

4. **Sem Truncate Agressivo**
   - ❌ Nunca: `TRUNCATE usuarios;`
   - ✅ Sempre: `DELETE ... WHERE ...`

---

## 📋 Checklist para Novos Testes

Ao criar um novo teste automatizado, siga:

- [ ] Use prefixo `qa_` em todos os nomes de usuário
- [ ] Use domínio `@test.com` em todos os e-mails
- [ ] Não reutilize credenciais de testes manuais
- [ ] Não altere dados que não criou
- [ ] Registre a massa de dados em comentários de teste
- [ ] Execute `npm run cleanup-qa` antes de novo ciclo
- [ ] Verifique que dados manuais não foram afetados

---

## 🔄 Fluxo de Trabalho Recomendado

```
┌─────────────────────────────────────────────────────┐
│ Desenvolvimento de Novo Teste                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. Escrever teste com prefixo qa_                  │
│    ✓ const name = 'qa_novo_teste_001'             │
│                                                     │
│ 2. Executar localmente                             │
│    ✓ npm run test:api                              │
│                                                     │
│ 3. Limpar dados automáticos                        │
│    ✓ npm run cleanup-qa                            │
│                                                     │
│ 4. Verificar dados manuais intactos               │
│    ✓ SELECT * FROM usuarios WHERE nome != 'qa_%'  │
│                                                     │
│ 5. Commit com mensagem clara                       │
│    ✓ "feat: adiciona teste de transferência"      │
│                                                     │
│ 6. Push para branch de feature                     │
│    ✓ PR com descrição de dados usados              │
│                                                     │
│ 7. CI/CD executa cleanup + testes                 │
│    ✓ Pipeline garante isolamento                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 Referências SBTM

Esta estratégia suporta **Session-Based Test Management (SBTM)** permitindo:

1. **Testes Exploratórios Contínuos**
   - QA explora bugs reais com dados realistas
   - Não precisa aguardar reset de banco

2. **Rastreabilidade de Dados**
   - Cada teste automático deixa "pegadas" (qa_)
   - Fácil identificar qual automação criou qual bug report

3. **Reutilização de Massa de Dados**
   - Dados manuais acumulam-se por semanas
   - Novos cenários emergem (extrato com 100 transações)

4. **Conformidade com Práticas Ágeis**
   - Testes continuam enquanto código evolui
   - Sem bloqueios ou sincronizações complexas

---

## 📞 Suporte e Troubleshooting

### **P: Por que meu teste foi deletado?**
R: Se começou com `qa_` ou usou `@test.com`, foi limpo. Mantenha dados manuais com nomes reais.

### **P: Como preservar um teste para usar depois?**
R: Use nome real e e-mail real (ex: `bruno.costa@gmail.com`). Não será limpo.

### **P: Posso confiar que dados manuais são seguros?**
R: Sim! Script verifica NOME e EMAIL. Se nenhum deles tiver `qa_` ou `@test.com`, é preservado.

### **P: Script está muito lento**
R: Verifique conexão MySQL. Para bancos muito grandes, adicione índices em `nome` e `email`.

---

## ✨ Conclusão

A **limpeza cirúrgica** transforma o banco de dados em um ativo compartilhado:

- **Automação** = cria dados reproduzíveis (qa_)
- **Testes Manuais** = exploram com dados reais
- **Pipeline CI** = executa em ciclos contínuos sem bloqueios

Resultado: **Confiança Máxima com Mínimo Esforço** 🎯

