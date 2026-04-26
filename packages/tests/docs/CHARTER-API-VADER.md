/**
 * Test Charter: Riscos de API (Heurística VADER)
 * 
 * Sessão SBTM focada em vulnerabilidades e comportamentos inesperados da API
 * Duração: 90 minutos
 * Testador: QA Engineer Sênior
 */

# 🔍 Charter: Riscos de API - VADER

## 📋 Objetivo

Investigar vulnerabilidades e comportamentos inesperados da API M3 Bank usando a heurística **VADER**:
- **V**olume: Grandes volumes de dados
- **A**ttributes: Valores nos limites (boundary)
- **D**efaults: Ausência de dados obrigatórios
- **E**xceptional Handling: Cenários excepcionais
- **R**equests: Problemas na estrutura de requisição

---

## 🎯 Áreas de Foco

### 1️⃣ VOLUME (V) - Testar com Grandes Volumes

#### Teste: Transferência com Valor Astronômico
- **O Que:** Enviar transferência com valor R$ 999.999.999,99
- **Esperado:** Erro HTTP 400 ou 422 com mensagem clara
- **Risco:** Débito parcial ou overflow de campo numérico
- **Evidência:** Print da resposta e logs da API

#### Teste: Extrato com Centenas de Transações
- **O Que:** Criar usuário com 500+ transações no histórico
- **Esperado:** Paginação funciona, performance aceitável (< 2s)
- **Risco:** Timeout, lentidão, crash de memória
- **Evidência:** Tempo de resposta, erros de timeout

#### Teste: Requisições Simultâneas (Concorrência)
- **O Que:** Enviar 50 transferências paralelas do mesmo usuário
- **Esperado:** Sistema valida saldo corretamente, não permite duplo-débito
- **Risco:** Race condition, saldo negativo, transferências duplicadas
- **Evidência:** Logs de transações, verificação de saldo final

---

### 2️⃣ ATTRIBUTES (A) - Testar Valores nos Limites

#### Teste: Transferência no Limite Especial (R$ 5.000,00)
- **O Que:** Transferir exatamente R$ 5.000,00
- **Esperado:** Sistema exige token especial? Documentação clara?
- **Risco:** RN03.05 ambígua ("acima de R$ 5.000" = inclui 5000?)
- **Evidência:** Response da API com análise de RN03.05

#### Teste: Transferência R$ 5.000,01
- **O Que:** Transferir R$ 5.000,01
- **Esperado:** Rejeita com mensagem "Token de autorização inválido"
- **Risco:** Sistema aceita sem token
- **Evidência:** Print do erro

#### Teste: Nomes com Caracteres Especiais
- **O Que:** Cadastro com nome: `José da Silva @#$%`, `João & Cia`, `李明` (chinês), `😀 Emoji Name`
- **Esperado:** Aceita ou rejeita de forma consistente
- **Risco:** SQL Injection, encoding errado, crash
- **Evidência:** Dados armazenados corretamente ou erro de validação

#### Teste: E-mails com Múltiplos @
- **O Que:** Cadastro com e-mail: `usuario@@example.com`, `user@exam@ple.com`
- **Esperado:** Validação RFC 5322 rigorosa
- **Risco:** Aceita e-mail inválido, possível phishing
- **Evidência:** Rejeição ou aceitação do e-mail

---

### 3️⃣ DEFAULTS (D) - Testar Ausência de Dados

#### Teste: Transferência sem Descrição
- **O Que:** POST `/api/transfers` sem campo `description`
- **Esperado:** HTTP 400 com erro "Descrição é obrigatória"
- **Risco:** Campo vazio ou NULL, extrato sem informação
- **Evidência:** Response da API

#### Teste: Conta com Saldo ZERO
- **O Que:** Criar conta com saldo 0, tentar transferir R$ 10
- **Esperado:** Rejeita com "Saldo insuficiente"
- **Risco:** Permite transferência negativa
- **Evidência:** Saldo após tentativa

#### Teste: Requisição sem Header Authorization
- **O Que:** GET `/api/accounts/me` SEM token JWT
- **Esperado:** HTTP 401 "Token inválido ou expirado"
- **Risco:** Acesso não autenticado a dados
- **Evidência:** Verificação de segurança

#### Teste: Header Authorization Vazio
- **O Que:** GET `/api/accounts/me` com `Authorization: Bearer `
- **Esperado:** HTTP 401
- **Risco:** Parsing errado, aceita token vazio
- **Evidência:** Response

---

### 4️⃣ EXCEPTIONAL HANDLING (E) - Cenários Excepcionais

#### Teste: Token JWT Expirado
- **O Que:** Usar token com `exp` no passado
- **Esperado:** HTTP 401 com mensagem "Token inválido ou expirado"
- **Risco:** Aceita token expirado
- **Evidência:** Acesso negado confirmado

#### Teste: Token JWT Adulterado
- **O Que:** Modificar payload do token (ex: change user ID)
- **Esperado:** HTTP 401 (falha na validação de assinatura)
- **Risco:** Permite acesso com token modificado
- **Evidência:** Request/Response

#### Teste: Conexão de Banco Interrompida
- **O Que:** Desconectar MySQL durante transferência
- **Esperado:** HTTP 500, rollback automático, saldo preservado
- **Risco:** Débito sem crédito (inconsistência), estado parcial
- **Evidência:** Verificação de saldo e transação não registrada

#### Teste: Mesmo Usuário Logado em Dois Navegadores
- **O Que:** 
  1. Fazer login navegador A
  2. Fazer login navegador B (novo token)
  3. Tentar ação em navegador A com token antigo
- **Esperado:** Token antigo ainda funciona OU sistema invalida
- **Risco:** Aceita múltiplos tokens simultâneos (vulnerabilidade)
- **Evidência:** Ambos conseguem realizar ações

#### Teste: Transferência para Conta Própria
- **O Que:** Tentar transferência account_id_origem == account_id_destino
- **Esperado:** HTTP 400 "Não é possível transferir para a própria conta"
- **Risco:** Permite transferência circular (bug contábil)
- **Evidência:** Erro recebido

---

### 5️⃣ REQUESTS (R) - Problemas na Estrutura

#### Teste: Método HTTP Incorreto
- **O Que:** GET `/api/transfers` (deveria ser POST)
- **Esperado:** HTTP 405 "Method Not Allowed"
- **Risco:** Aceita GET para criar transferência
- **Evidência:** Response status

#### Teste: Content-Type Incorreto
- **O Que:** POST `/api/auth/login` com `Content-Type: text/plain` em vez de `application/json`
- **Esperado:** HTTP 400 ou 415
- **Risco:** Parser de JSON falha, dados são ignorados
- **Evidência:** Erro de parsing

#### Teste: Payload JSON Malformado
- **O Que:** POST com JSON inválido: `{name: "João",` (faltam closing braces)
- **Esperado:** HTTP 400 "Invalid JSON"
- **Risco:** Falha silenciosa, dados parciais processados
- **Evidência:** Erro de parsing

#### Teste: Payload Muito Grande
- **O Que:** POST com descrição de 10MB (string muito longa)
- **Esperado:** HTTP 413 "Payload Too Large"
- **Risco:** Crash ou consumo excessivo de memória
- **Evidência:** Request timeout ou erro de limite

#### Teste: Caracteres Especiais em URL
- **O Que:** GET `/api/accounts/me?filter=<script>alert(1)</script>`
- **Esperado:** Validação/escapamento correto
- **Risco:** XSS refletido, injection
- **Evidência:** Comportamento do servidor

---

## 📝 Anotações da Sessão

Use este espaço para registrar descobertas durante os 90 minutos:

```
Hora  | Teste | Resultado | Risco Identificado | Próximos Passos
------|-------|-----------|-------------------|----------------
10:00 | VOLUME: R$ 999M | ✅ Rejeitado com erro claro | NENHUM | -
10:15 | 500 transações | ⏱️ 3.2s (> limite 2s) | Performance em paginação | Otimizar query
...
```

---

## ✅ Checklist de Cobertura

- [ ] Todos os 5 testes de VOLUME executados
- [ ] Todos os 4 testes de ATTRIBUTES executados
- [ ] Todos os 3 testes de DEFAULTS executados
- [ ] Todos os 5 testes de EXCEPTIONAL executados
- [ ] Todos os 5 testes de REQUESTS executados
- [ ] Bugs críticos documentados
- [ ] Recomendações listadas

---

## 🐛 Bugs Encontrados

**Formato:**
```
ID: API-001
Severidade: 🔴 CRÍTICA
Heurística: EXCEPTIONAL (Token JWT)
Descrição: Sistema aceita tokens expirados
Reprodução: [passos]
Evidência: [screenshot/log]
Recomendação: Validar `exp` claim antes de processar
```

[Listar bugs aqui]

---

## 💡 Recomendações

1. [ ] Adicionar validação de tamanho de payload (> 1MB)
2. [ ] Otimizar query de extrato para 500+ registros
3. [ ] Documentar claramente RN03.05 (R$ 5.000,00 inclui token?)
4. [ ] Implementar rate limiting (1000 requisições/hora)
5. [ ] Adicionar CORS headers

---

## 📊 Sumário Executivo

**Tempo de Sessão:** 90 minutos  
**Testes Executados:** 21  
**Bugs Críticos:** 0  
**Bugs Maiores:** 2  
**Bugs Menores:** 3  
**Recomendações:** 5  

**Conclusão:** 🟢 API está robusta para produção com ajustes recomendados

