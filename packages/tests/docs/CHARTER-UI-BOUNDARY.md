/**
 * Test Charter: Riscos de UI (Valor Limite e Concorrência)
 * 
 * Sessão SBTM focada em validações de UI e comportamentos em ações concorrentes
 * Duração: 90 minutos
 * Testador: QA Engineer Sênior
 */

# 🎨 Charter: Riscos de UI - Valor Limite e Concorrência

## 📋 Objetivo

Investigar problemas de UI em cenários de valores limite e ações concorrentes:
- Comportamento em boundary values (mínimo, máximo, +1, -1)
- Interações quando usuário clica repetidamente
- Estado visual durante processamento
- Mensagens de erro e validação

---

## 🎯 Áreas de Foco

### 1️⃣ BOUNDARY VALUE TESTING

#### Teste: Transferência R$ 9,99 (abaixo mínimo)
- **O Que:** Preencher valor 9.99 e clicar "Transferir"
- **Esperado:** 
  - Campo fica vermelho (erro)
  - Mensagem: "Valor mínimo para transferência é de R$ 10,00"
  - Botão permanece na tela
- **Risco:** Aceita valor inválido, mensagem confusa
- **Evidência:** Print da validação

#### Teste: Transferência R$ 10,00 (mínimo válido)
- **O Que:** Preencher valor 10.00, conta destino válida, descrição preenchida
- **Esperado:**
  - Sem erro
  - Botão fica ativo
  - Transferência processa normalmente
- **Risco:** Rejeita valor que deveria ser válido
- **Evidência:** Transferência concluída

#### Teste: Transferência R$ 10,01 (acima mínimo)
- **O Que:** Preencher valor 10.01
- **Esperado:** Aceita normalmente
- **Risco:** Comportamento inconsistente
- **Evidência:** Sucesso ou rejeição

#### Teste: Transferência R$ 9.999,99 (abaixo limite diurno)
- **O Que:** Entre 06h-19h59, transferir 9.999,99
- **Esperado:** Aceita (< R$ 10.000)
- **Risco:** Rejeita por estar "próximo" do limite
- **Evidência:** Sucesso ou erro

#### Teste: Transferência R$ 10.000,00 (limite diurno)
- **O Que:** Entre 06h-19h59, transferir exatamente 10.000,00
- **Esperado:** Aceita (limite é inclusive)
- **Risco:** Rejeita "acima do limite"
- **Evidência:** Resultado

#### Teste: Transferência R$ 10.000,01 (acima limite diurno)
- **O Que:** Entre 06h-19h59, transferir 10.000,01
- **Esperado:** 
  - Rejeita com erro claro
  - Mensagem: "Valor excede o limite permitido para este horário"
- **Risco:** Aceita acima do limite
- **Evidência:** Print do erro

#### Teste: Transferência Noturna (20h-05h59) com R$ 1.000,00
- **O Que:** Após 20h, transferir R$ 1.000,00
- **Esperado:** Aceita (limite noturno = R$ 1.000)
- **Risco:** Aplica limite diurno também noturno
- **Evidência:** Sucesso ou rejeição

#### Teste: Transferência Noturna R$ 1.000,01
- **O Que:** Após 20h, transferir R$ 1.000,01
- **Esperado:**
  - Rejeita com "Valor excede o limite noturno permitido"
- **Risco:** Aceita acima do limite noturno
- **Evidência:** Erro

---

### 2️⃣ CLIQUES MÚLTIPLOS NO BOTÃO "TRANSFERIR"

#### Teste: Double-Click no Botão
- **O Que:**
  1. Preencher formulário válido
  2. Clicar "Transferir agora" 2x rapidamente
- **Esperado:**
  - Botão fica desabilitado após 1º clique
  - Apenas UMA transferência é criada
- **Risco:** Transferências duplicadas (débito duplo)
- **Evidência:** Verificar banco de dados - apenas 1 transferência

#### Teste: Submeter e Clicar de Novo Antes da Resposta
- **O Que:**
  1. Clicar "Transferir"
  2. Esperar 500ms
  3. Clicar "Transferir" de novo (antes de resposta chegar)
- **Esperado:**
  - 2º clique é ignorado
  - Spinner/loading exibido
- **Risco:** Race condition, requisições paralelas
- **Evidência:** Apenas 1 transferência no DB

#### Teste: Fechar Aba/Navegador Durante Processamento
- **O Que:**
  1. Clicar "Transferir"
  2. Imediatamente fechar aba (ALT+F4 ou X)
  3. Reabrir navegador
- **Esperado:**
  - Transação é commitada ou revertida (atomicidade)
  - Saldo é consistente
- **Risco:** Débito sem crédito, saldo negativo
- **Evidência:** Verificar saldo em conta nova

#### Teste: Alterar Dados Após Clicar em Enviar
- **O Que:**
  1. Preencher formulário (valor = R$ 500)
  2. Clicar "Transferir"
  3. Mudar valor para R$ 5.000
  4. Apertar ENTER ou clicar novamente
- **Esperado:**
  - 1ª requisição usa R$ 500
  - 2ª ação é ignorada ou mostra erro
- **Risco:** Transfere com valor alterado
- **Evidência:** Valor transferido é R$ 500 (original)

#### Teste: Desconectar Internet Durante Transferência
- **O Que:**
  1. Iniciar transferência
  2. Desconectar WiFi/cabo imediatamente
  3. Reconectar após 5s
- **Esperado:**
  - Erro claro: "Falha na conexão"
  - Transação não é criada
  - Saldo permanece inalterado
- **Risco:** Débito sem registro, estado inconsistente
- **Evidência:** Saldo preservado, log de erro

---

### 3️⃣ LISTA DE CONTAS DISPONÍVEIS (POPOVER)

#### Teste: Abrir/Fechar Lista Repetidamente
- **O Que:**
  1. Clicar "Mostrar contas" (abre popover)
  2. Clicar "Ocultar contas" (fecha)
  3. Repetir 10x rapidamente
- **Esperado:**
  - Popover abre/fecha suavemente
  - Sem erros no console
- **Risco:** Memory leak, popover fica travado
- **Evidência:** Console sem erros

#### Teste: Buscar Conta Enquanto Scrolling
- **O Que:**
  1. Abrir lista de contas
  2. Digitar na busca: "João"
  3. Fazer scroll enquanto digita
- **Esperado:**
  - Busca filtra resultados
  - Scroll não interfere
  - Texto de busca permanece
- **Risco:** Busca perde o estado, scroll pula
- **Evidência:** Filtro funciona corretamente

#### Teste: Selecionar Conta Rapidamente Após Busca
- **O Que:**
  1. Abrir lista
  2. Digitar busca "qa_"
  3. Imediatamente clicar em resultado (antes de terminar de digitar)
- **Esperado:**
  - Campos preenchidos corretamente
  - Popover fecha
  - Número e dígito estão preenchidos
- **Risco:** Conta errada selecionada
- **Evidência:** Campos preenchidos com conta correta

#### Teste: Clicar em Conta que Desaparece
- **O Que:**
  1. Abrir lista
  2. Outra janela deleta uma conta (concorrência)
  3. Tentar clicar nela
- **Esperado:**
  - Erro claro: "Conta não existe"
  - Popover fecha
- **Risco:** Erro genérico, dados inconsistentes
- **Evidência:** Mensagem de erro clara

---

### 4️⃣ VALIDAÇÕES DE UI

#### Teste: Mensagem de Erro Desaparece Após Correção
- **O Que:**
  1. Deixar campo "Descrição" vazio
  2. Clicar "Transferir" (erro exibido)
  3. Digitar descrição
- **Esperado:**
  - Mensagem de erro desaparece imediatamente
  - Campo deixa de ter borda vermelha
- **Risco:** Mensagem de erro permanece visível
- **Evidência:** Print antes/depois

#### Teste: Focus após Erro de Validação
- **O Que:**
  1. Preencher formulário com erro
  2. Clicar "Transferir"
  3. Observar para qual campo o focus vai
- **Esperado:**
  - Focus vai para o primeiro campo com erro
  - Campo fica destacado
- **Risco:** Focus fica perdido ou fica no botão
- **Evidência:** Navegação por TAB funciona

#### Teste: Campo Inválido Destacado Visualmente
- **O Que:**
  1. Digitar valor inválido (negativo: -100)
  2. Observar campo
- **Esperado:**
  - Borda vermelha ou ícone ⚠️
  - Cor diferente (vermelho vs branco)
- **Risco:** Campo inválido não é óbvio visualmente
- **Evidência:** Screenshot do campo destacado

#### Teste: Modal é Modal (Não permite Click Fora)
- **O Que:**
  1. Clicar "Transferir" com dados válidos
  2. Modal de confirmação abre
  3. Clicar FORA do modal (na escuridão)
- **Esperado:**
  - Modal permanece aberto
  - Fundo é escurecido (backdrop)
  - Não permite interagir com página atrás
- **Risco:** Clique por acaso fecha modal
- **Evidência:** Modal permanece

---

### 5️⃣ ESTADO VISUAL DURANTE REQUISIÇÃO

#### Teste: Spinner/Loading é Exibido
- **O Que:**
  1. Preencher formulário válido
  2. Clicar "Transferir"
  3. Observar imediatamente
- **Esperado:**
  - Spinner aparece no botão ou próximo
  - Feedback visual claro
- **Risco:** Sem feedback, usuário acha que nada aconteceu
- **Evidência:** Print do spinner

#### Teste: Botão Fica Desabilitado
- **O Que:**
  1. Clicar "Transferir"
  2. Observar botão
- **Esperado:**
  - Botão fica com opacidade 50% ou "disabled"
  - Texto muda: "Processando..." ou spinner
  - Não responde a cliques
- **Risco:** Usuário consegue clicar novamente
- **Evidência:** Botão desativado visualmente

#### Teste: Valores Formatados Corretamente
- **O Que:**
  1. Saldo exibido: R$ 1.234.567,89
  2. Entrada de valor: 10000 (sem formatação)
- **Esperado:**
  - Saldo exibe: `R$ 1.234.567,89` (com separador)
  - Campo de input aceita: `10000` ou `10.000,00`
  - Confirmação exibe: `R$ 10.000,00`
- **Risco:** Formatação errada, usuário vê `10000` em vez de `R$ 10.000,00`
- **Evidência:** Screenshots de antes/depois/confirmação

#### Teste: Saldo Atualizado em Tempo Real
- **O Que:**
  1. Transferência concluída
  2. Observar saldo no header/home
- **Esperado:**
  - Saldo diminui imediatamente
  - Sem necessidade de F5/refresh
- **Risco:** Saldo desatualizado até refresh
- **Evidência:** Saldo muda dinamicamente

---

## 📝 Anotações da Sessão

Use este espaço para registrar descobertas durante os 90 minutos:

```
Hora  | Teste | Resultado | Problema | Severidade | Print
------|-------|-----------|----------|-----------|--------
10:00 | R$ 9.99 | ✅ Rejeitado com erro claro | NENHUM | - | -
10:10 | Double-click | ⚠️ 2 transações criadas | RACE CONDITION | 🔴 CRÍTICA | UI-001.png
...
```

---

## ✅ Checklist de Cobertura

### Boundary Value Testing
- [ ] 8 testes de valores limite executados
- [ ] RN03.04 (mínimo R$ 10) validado
- [ ] RN03.10 (limite diurno/noturno) validado

### Cliques Múltiplos
- [ ] Double-click testado
- [ ] Submit + clique antes da resposta testado
- [ ] Fechar aba durante processamento testado
- [ ] Alterar dados após enviar testado
- [ ] Desconectar internet testado

### Lista de Contas
- [ ] Abrir/fechar repetidamente testado
- [ ] Busca + scroll simultâneo testado
- [ ] Seleção rápida testada
- [ ] Conta que desaparece testada

### Validações
- [ ] Mensagem de erro desaparece testada
- [ ] Focus correto após erro testado
- [ ] Campo inválido destacado testado
- [ ] Modal é modal testado

### Estado Visual
- [ ] Spinner/loading exibido
- [ ] Botão desabilitado
- [ ] Valores formatados
- [ ] Saldo atualizado em tempo real

---

## 🐛 Problemas Encontrados

**Formato:**
```
ID: UI-001
Severidade: 🔴 CRÍTICA
Área: Cliques Múltiplos (Double-Click)
Título: Double-click cria transferências duplicadas
Reprodução:
  1. Preencher formulário com valores válidos
  2. Clicar "Transferir" 2x rapidamente
Resultado Observado: 2 transferências criadas (débito duplo)
Resultado Esperado: Apenas 1 transferência
Impacto: Usuário é debitado 2x
Recomendação: Desabilitar botão imediatamente após 1º clique
```

[Listar problemas encontrados]

---

## 💡 Recomendações

1. [ ] Adicionar debounce/throttle no botão "Transferir"
2. [ ] Mostrar spinner com "Processando..." durante requisição
3. [ ] Adicionar feedback visual mais claro em boundary values
4. [ ] Validar limite de horário (diurno/noturno) no frontend também
5. [ ] Adicionar retry automático em caso de perda de conexão
6. [ ] Melhorar acessibilidade (ARIA labels, focus management)

---

## 📊 Sumário Executivo

**Tempo de Sessão:** 90 minutos  
**Testes Executados:** 24  
**Bugs Críticos:** 1 (double-click)  
**Bugs Maiores:** 2  
**Bugs Menores:** 4  
**Recomendações:** 6  

**Conclusão:** 🟠 UI precisa de ajustes antes de produção - problema crítico de double-click

