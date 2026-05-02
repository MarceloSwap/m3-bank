# language: pt

Funcionalidade: RN01 - Cadastro de Contas
  Como um novo usuário do M3 Bank
  Quero criar uma conta bancária
  Para ter acesso aos serviços financeiros da plataforma

  Contexto:
    Dado que estou na tela de cadastro do M3 Bank

  @smoke @api @e2e
  Cenário: Cadastro bem-sucedido com saldo inicial
    Dado que preencho os dados válidos de cadastro
    E marco a opção "Criar conta com saldo"
    Quando clico em "Criar conta"
    Então a conta é criada com sucesso
    E o saldo inicial é de R$ 1.000,00
    E o número da conta é exibido na tela

  @smoke @e2e
  Cenário: Cadastro bem-sucedido sem saldo inicial
    Dado que preencho os dados válidos de cadastro
    E não marco a opção "Criar conta com saldo"
    Quando clico em "Criar conta"
    Então a conta é criada com sucesso
    E o saldo inicial é de R$ 0,00

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
      | senha  | resultado                                        |
      | 12345  | Senha deve conter no minimo 6 caracteres         |
      | 123456 | Conta criada com sucesso                         |

  @api
  Cenário: Bloquear cadastro com e-mail já existente
    Dado que já existe uma conta com o e-mail "qa@m3bank.test"
    Quando tento cadastrar outro usuário com o mesmo e-mail
    Então recebo o status HTTP 400
    E a mensagem é "E-mail já cadastrado"
