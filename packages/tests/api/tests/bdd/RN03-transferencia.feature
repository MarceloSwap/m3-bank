# language: pt

Funcionalidade: RN03 - Transferências
  Como um usuário autenticado no M3 Bank
  Quero transferir valores para outras contas
  Para movimentar meu dinheiro de forma segura

  Contexto:
    Dado que estou autenticado com uma conta com saldo de R$ 1.000,00
    E estou na tela de Transferências

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
  Esquema do Cenário: Análise de Valor Limite — valor mínimo de transferência
    Quando informo o valor "<valor>"
    E clico em "Transferir agora"
    Então o resultado é "<resultado>"

    Exemplos:
      | valor   | resultado                                          |
      | 9.99    | Valor mínimo para transferência                    |
      | 10.00   | Transferência realizada com sucesso                |

  @seguranca @api @e2e
  Cenário: Transferência acima de R$ 5.000,00 exige token de autorização
    Dado que existe uma conta de destino ativa
    Quando informo o valor de R$ 5.000,01
    E clico em "Transferir agora"
    Então o sistema solicita o token de autorização especial

  @seguranca @api @e2e
  Cenário: Token de autorização inválido bloqueia a transferência
    Dado que existe uma conta de destino ativa
    Quando informo o valor de R$ 5.000,01
    E informo o token de autorização "000000"
    E clico em "Transferir agora"
    Então recebo uma mensagem de erro de token inválido

  @antifraude @api @e2e
  Cenário: Transferência para a própria conta é bloqueada
    Quando preencho o número e dígito da minha própria conta como destino
    E informo o valor de R$ 150,00
    E clico em "Transferir agora"
    Então vejo a mensagem "Não é possível transferir para a própria conta"

  @validacao @api @e2e
  Cenário: Transferência para conta inexistente é bloqueada
    Quando preencho o número "00000" e dígito "0" como destino
    E informo o valor de R$ 50,00
    E clico em "Transferir agora"
    Então vejo a mensagem "Conta inválida ou inexistente"

  @validacao @api
  Cenário: Transferência com saldo insuficiente é bloqueada
    Quando informo um valor superior ao saldo disponível
    E clico em "Transferir agora"
    Então recebo o status HTTP 400
    E a mensagem indica saldo insuficiente

  @limite @api @e2e
  Cenário: Limite noturno bloqueia transferência acima de R$ 1.000,00 entre 20h e 05h59
    Dado que o horário atual é 22h00
    E existe uma conta de destino ativa
    Quando informo o valor de R$ 1.000,01
    E clico em "Transferir agora"
    Então vejo a mensagem "Valor excede o limite noturno permitido"

  @limite @e2e
  Cenário: Limite diurno permite transferência até R$ 10.000,00 entre 06h e 19h59
    Dado que o horário atual é 10h00
    E existe uma conta de destino ativa com saldo suficiente
    Quando informo o valor de R$ 10.000,00
    E informo o token de autorização "123456"
    E clico em "Transferir agora"
    Então vejo a mensagem "Transferência realizada com sucesso"

  @usabilidade @e2e
  Cenário: Selecionar conta na lista preenche os campos automaticamente
    Quando clico em "Mostrar contas disponíveis"
    E seleciono um favorecido da lista
    Então os campos "Número da conta" e "Dígito" são preenchidos automaticamente
    E minha própria conta não aparece na lista
