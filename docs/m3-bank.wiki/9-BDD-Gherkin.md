# 9. BDD — Especificações Gherkin

**M3 Bank** | **Versão:** 1.1
**Testador:** Marcelo Ferreira | **Mentoria:** Turma 2 – Júlio de Lima
**Baseado em:** Behavior-Driven Development (Dan North) + Gherkin

---

## Introdução

Esta página centraliza todas as especificações BDD do M3 Bank no formato **Gherkin** (`Dado / Quando / Então`).

Os arquivos `.feature` estão em `packages/tests/api/tests/bdd/` e servem como:
- Documentação viva rastreada às User Stories e RNs
- Base para implementação futura com **Cucumber.js** ou **Cypress-Cucumber-Preprocessor**
- Contrato de comportamento entre QA, Dev e PO

**Tags utilizadas:**

| Tag | Significado |
|-----|-------------|
| `@smoke` | Cenário crítico — executado em todo pipeline |
| `@validacao` | Testa campos obrigatórios e mensagens de erro |
| `@limite` | Análise de Valor Limite (AVL) |
| `@seguranca` | Autenticação, autorização e JWT |
| `@antifraude` | Regras de proteção contra fraude |
| `@usabilidade` | Comportamento da interface |
| `@api` | Coberto por Supertest |
| `@e2e` | Coberto por Cypress |
| `@falha-conhecida` | Cenário automatizado com defeito aberto |

---

## RN01 — Cadastro de Contas

**Arquivo:** `packages/tests/api/tests/bdd/RN01-cadastro.feature`

```gherkin
Funcionalidade: RN01 - Cadastro de Contas
  Como um novo usuário do M3 Bank
  Quero criar uma conta bancária
  Para ter acesso aos serviços financeiros da plataforma

  @smoke @api @e2e
  Cenário: Cadastro bem-sucedido com saldo inicial
    Dado que preencho os dados válidos de cadastro
    E marco a opção "Criar conta com saldo"
    Quando clico em "Criar conta"
    Então a conta é criada com sucesso
    E o saldo inicial é de R$ 1.000,00
    E o número da conta é exibido na tela

  @validacao @e2e
  Cenário: Campos obrigatórios vazios
    Quando clico em "Criar conta" sem preencher nenhum campo
    Então vejo a mensagem "Nome nao pode ser vazio"
    E vejo a mensagem "Email nao pode ser vazio"
    E vejo a mensagem "CPF nao pode ser vazio"
    E vejo a mensagem "Senha nao pode ser vazio"

  @validacao @e2e
  Cenário: Senhas divergentes bloqueiam o cadastro
    Dado que preencho os dados válidos de cadastro
    E informo senhas diferentes nos campos "Senha" e "Confirmar senha"
    Quando clico em "Criar conta"
    Então vejo a mensagem "As senhas nao coincidem"

  @limite @e2e
  Esquema do Cenário: Análise de Valor Limite — comprimento mínimo da senha
    Dado que preencho os dados válidos de cadastro
    E informo a senha "<senha>"
    Quando clico em "Criar conta"
    Então o resultado é "<resultado>"

    Exemplos:
      | senha  | resultado                                |
      | 12345  | Senha deve conter no minimo 6 caracteres |
      | 123456 | Conta criada com sucesso                 |

  @api
  Cenário: Bloquear cadastro com e-mail já existente
    Dado que já existe uma conta com o e-mail "qa@m3bank.test"
    Quando tento cadastrar outro usuário com o mesmo e-mail
    Então recebo o status HTTP 400
    E a mensagem é "E-mail já cadastrado"
```

---

## RN02 — Login e Autenticação

**Arquivo:** `packages/tests/api/tests/bdd/RN02-login.feature`

```gherkin
Funcionalidade: RN02 - Login e Autenticação
  Como um usuário cadastrado no M3 Bank
  Quero fazer login com minhas credenciais
  Para acessar minha conta e realizar operações financeiras

  @smoke @api @e2e
  Cenário: Login bem-sucedido com credenciais válidas
    Dado que existe uma conta cadastrada com e-mail e senha válidos
    Quando informo o e-mail e a senha corretos
    E clico em "Acessar dashboard"
    Então sou redirecionado para a Home
    E um token JWT é armazenado no localStorage

  @validacao @e2e
  Cenário: Campos obrigatórios vazios
    Quando clico em "Acessar dashboard" sem preencher nenhum campo
    Então vejo a mensagem "Usuario e senha precisam ser preenchidos"

  @seguranca @api
  Cenário: Requisição sem token retorna 401
    Quando acesso uma rota protegida sem enviar o header Authorization
    Então recebo o status HTTP 401
    E o corpo da resposta contém a propriedade "message"
```

---

## RN03 — Transferências ⭐ Core Business

**Arquivo:** `packages/tests/api/tests/bdd/RN03-transferencia.feature`

```gherkin
Funcionalidade: RN03 - Transferências
  Como um usuário autenticado no M3 Bank
  Quero transferir valores para outras contas
  Para movimentar meu dinheiro de forma segura

  @smoke @api @e2e
  Cenário: Transferência bem-sucedida entre duas contas
    Dado que existe uma conta de destino ativa
    Quando preencho o número e dígito da conta de destino
    E informo o valor de R$ 150,00
    E informo uma descrição
    E clico em "Transferir agora"
    Então vejo a mensagem "Transferência realizada com sucesso"
    E o saldo é debitado em tempo real

  @limite @api @e2e
  Esquema do Cenário: Análise de Valor Limite — valor mínimo
    Quando informo o valor "<valor>"
    E clico em "Transferir agora"
    Então o resultado é "<resultado>"

    Exemplos:
      | valor | resultado                           |
      | 9.99  | Valor mínimo para transferência     |
      | 10.00 | Transferência realizada com sucesso |

  @seguranca @api @e2e @falha-conhecida
  Cenário: Transferência acima de R$ 5.000,00 exige token de autorização
    Quando informo o valor de R$ 5.000,01
    E clico em "Transferir agora"
    Então o sistema solicita o token de autorização especial

  @antifraude @api @e2e
  Cenário: Transferência para a própria conta é bloqueada
    Quando preencho o número e dígito da minha própria conta como destino
    E informo o valor de R$ 150,00
    E clico em "Transferir agora"
    Então vejo a mensagem "Não é possível transferir para a própria conta"

  @limite @api @e2e @falha-conhecida
  Cenário: Limite noturno bloqueia transferência acima de R$ 1.000,00 entre 20h e 05h59
    Dado que o horário atual é 22h00
    Quando informo o valor de R$ 1.000,01
    E clico em "Transferir agora"
    Então vejo a mensagem "Valor excede o limite noturno permitido"

  @validacao @api
  Cenário: Transferência com saldo insuficiente é bloqueada
    Quando informo um valor superior ao saldo disponível
    E clico em "Transferir agora"
    Então recebo o status HTTP 400
    E a mensagem indica saldo insuficiente
```

---

## RN04 — Depósito Bancário

**Arquivo:** `packages/tests/api/tests/bdd/RN04-deposito.feature`

```gherkin
Funcionalidade: RN04 - Depósito Bancário

  @limite @api @e2e
  Esquema do Cenário: Análise de Valor Limite — depósito
    Quando informo o valor "<valor>"
    E clico em "Confirmar Depósito"
    Então o resultado é "<resultado>"

    Exemplos:
      | valor     | resultado                      |
      | 9.99      | Valor mínimo para depósito     |
      | 10.00     | Depósito realizado com sucesso |
      | 10000.00  | Depósito realizado com sucesso |
      | 10000.01  | Valor máximo para depósito     |
```

---

## RN07 — Perfil do Usuário

**Arquivo:** `packages/tests/api/tests/bdd/RN07-perfil.feature`

```gherkin
Funcionalidade: RN07 - Perfil do Usuário

  @seguranca @api @e2e
  Cenário: Senha atual incorreta bloqueia a alteração
    Dado que estou na aba "Alterar Senha"
    Quando preencho a senha atual com "SenhaErrada999"
    E preencho a nova senha com "Senha@654321"
    E clico em "Salvar"
    Então recebo o status HTTP 400
    E a mensagem é "Senha atual incorreta"

  @validacao @e2e
  Cenário: Confirmação de senha divergente bloqueia a alteração
    Quando preencho a nova senha com "Senha@654321"
    E confirmo a nova senha com "Senha@654321X"
    E clico em "Salvar"
    Então vejo a mensagem "As senhas nao coincidem"
```

---

## Cobertura BDD × Automação

| Feature | Cenários | @api coberto | @e2e coberto |
|---------|----------|-------------|-------------|
| RN01-cadastro.feature | 5 | ✅ | ✅ |
| RN02-login.feature | 6 | ✅ | ✅ |
| RN03-transferencia.feature | 9 | ✅ | ✅ |
| RN04-deposito.feature | 4 | ✅ | ✅ |
| RN05-pix.feature | 2 | ✅ | ✅ |
| RN06-extrato.feature | 5 | ✅ | ✅ |
| RN07-perfil.feature | 5 | ✅ | ✅ |

**Auditoria:** as features cobrem os critérios de aceite de RN01 a RN07. Os cenários de RN03.05 e RN03.10 estão especificados e automatizados, porém marcados como falha conhecida até correção dos defeitos DEF-004 e DEF-005.

---

## Próximo Passo — Integração com Cucumber.js

Para executar os `.feature` diretamente, instale:

```bash
npm install --save-dev @cucumber/cucumber
# ou para Cypress:
npm install --save-dev @badeball/cypress-cucumber-preprocessor
```

Os step definitions ficariam em `packages/tests/api/tests/bdd/steps/` ou `packages/tests/ui/cypress/e2e/step_definitions/`.

---

**Elaborado por:** Marcelo Ferreira
**Última atualização:** Maio de 2026
