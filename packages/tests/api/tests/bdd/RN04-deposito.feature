# language: pt

Funcionalidade: RN04 - Depósito Bancário
  Como um usuário autenticado no M3 Bank
  Quero depositar valores em contas ativas
  Para creditar saldo imediatamente

  Contexto:
    Dado que estou autenticado
    E estou na tela de Depósito

  @smoke @api @e2e
  Cenário: Depósito bem-sucedido dentro dos limites
    Dado que existe uma conta de destino ativa
    Quando preencho o número e dígito da conta de destino
    E informo o valor de R$ 500,00
    E informo uma descrição
    E clico em "Confirmar Depósito"
    Então vejo a mensagem de depósito realizado com sucesso
    E o saldo da conta destino é atualizado imediatamente

  @limite @api @e2e
  Esquema do Cenário: Análise de Valor Limite — depósito
    Quando informo o valor "<valor>"
    E clico em "Confirmar Depósito"
    Então o resultado é "<resultado>"

    Exemplos:
      | valor     | resultado                          |
      | 9.99      | Valor mínimo para depósito         |
      | 10.00     | Depósito realizado com sucesso     |
      | 10000.00  | Depósito realizado com sucesso     |
      | 10000.01  | Valor máximo para depósito         |

  @validacao @api @e2e
  Cenário: Depósito para conta inexistente é bloqueado
    Quando preencho o número "00000" e dígito "0" como destino
    E informo o valor de R$ 100,00
    E clico em "Confirmar Depósito"
    Então vejo a mensagem "Conta inválida ou inexistente"

  @usabilidade @e2e
  Cenário: Selecionar conta na lista preenche os campos automaticamente
    Quando clico em "Mostrar contas disponíveis"
    E seleciono uma conta da lista
    Então os campos "Número da conta" e "Dígito" são preenchidos automaticamente
