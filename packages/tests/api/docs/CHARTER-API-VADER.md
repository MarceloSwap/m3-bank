# 🕵️‍♂️ Charter de Teste Exploratório - API (Heurística VADER)

**Projeto:** M3 Bank
**Tipo:** Sessão de Teste Exploratório (SBTM)
**Duração Sugerida:** 90 minutos
**Estratégia de Dados:** Limpeza Cirúrgica (Usar prefixo `qa_` e domínio `@test.com`) 

---

## 🎯 Missão da Sessão
Explorar a API do M3 Bank em busca de vulnerabilidades, falhas de contrato e comportamentos inesperados utilizando a heurística **VADER**, garantindo a resiliência dos serviços de Cadastro, Login, Transferência, Depósito e PIX.

---

## 🔍 O que explorar (Heurística VADER)

### 1. V - Verbs (Verbos HTTP)
Testar o comportamento da API diante de verbos aptos e não aptos para cada endpoint.
* **Ações a explorar:**
  * Disparar um `GET` na rota de login (`/auth/login`) que deveria aceitar apenas `POST`.
  * Tentar enviar um payload (`body`) em requisições `GET` ou `DELETE` para ver como o servidor reage.
  * Verificar se rotas de atualização aceitam `PUT` e `PATCH` corretamente.
  * Validar se o uso do verbo errado retorna o status HTTP correto (ex: `405 Method Not Allowed`).

### 2. A - Authorization (Autorização)
Avaliar os mecanismos de proteção das rotas privadas utilizando tokens JWT (Bearer).
* **Ações a explorar:**
  * Acessar endpoints restritos (como transferência e extrato) enviando um token JWT expirado, inválido ou malformado.
  * Tentar acessar recursos protegidos sem enviar o header `Authorization`.
  * **Testes de Isolamento (IDOR):** Usar o token válido de um usuário para tentar consultar o extrato de outro.
  * Garantir que credenciais e senhas não trafeguem nas URLs.

### 3. D - Data (Dados)
Inspecionar a estrutura, os limites e os formatos dos dados que trafegam (Payload de envio e resposta).
* **Ações a explorar:**
  * **Tipagem:** Enviar strings onde a API espera números (ex: valor da transferência como `"100.00"` em vez de `100.00`).
  * **Formato:** Validar se os headers `Accept` e `Content-Type` forçam a API a retornar apenas `application/json`.
  * **Limites:** Enviar payloads com descrições gigantescas na transferência.
  * **Paginação:** No extrato, testar valores negativos de página ou limites excessivos.

### 4. E - Errors (Erros)
Avaliar minuciosamente os códigos de resposta e se as mensagens de erro seguem o padrão da aplicação.
* **Ações a explorar:**
  * **400 Bad Request:** Simular requisições malformadas e validar se a mensagem de erro aponta o campo falho.
  * **401/403:** Validar recusas de acesso por falta de permissão ou autenticação.
  * **404 Not Found:** Buscar contas ou lançamentos que não existem.
  * **500 Internal Server Error:** Forçar quebras lógicas para garantir que mensagens técnicas do banco de dados não vazem para o cliente.

### 5. R - Responsiveness (Capacidade de Resposta)
Monitorar o comportamento e o tempo de resposta do servidor sob estresse ou ações concorrentes.
* **Ações a explorar:**
  * **Tempo de Resposta:** Analisar se endpoints como o extrato completo demoram demais para retornar.
  * **Falha Rápida (Fail Fast):** A API deve barrar requisições sem token no middleware antes de consultar o banco.
  * **Concorrência (Race Conditions):** Disparar duas requisições de transferência simulando o mesmo milissegundo para testar a integridade do saldo.

---

## 📊 Relatório de Execução (Template)

**Data:** [DD/MM/AAAA]  
**Testador:** Marcelo Ferreira
**Tempo Gasto (Setup / Execução / Investigação):** [Ex: 10% / 70% / 20%]  

### 🚩 Descobertas e Riscos (Findings)
* [Descreva aqui os bugs ou comportamentos estranhos encontrados]
* [Anexe o cURL da requisição que falhou]
* [Anexe a resposta do servidor com o erro]