# language: pt

Funcionalidade: RN06 - Extrato e Saldo
  Como um usuário autenticado no M3 Bank
  Quero visualizar meu extrato e saldo
  Para acompanhar minha movimentação financeira

  Contexto:
    Dado que estou autenticado
    E estou na tela de Extrato

  @smoke @api @e2e
  Cenário: Extrato exibe saldo atualizado e lançamentos paginados
    Então vejo o saldo disponível atualizado
    E vejo a lista de lançamentos paginada
    E vejo a indicação "Página 1 de X"

  @e2e
  Cenário: Filtros de período funcionam corretamente
    Quando clico no botão "Últimos 7 dias"
    Então o filtro fica ativo e o extrato é filtrado
    Quando clico no botão "Últimos 15 dias"
    Então o filtro fica ativo e o extrato é filtrado
    Quando clico no botão "Últimos 30 dias"
    Então o filtro fica ativo e o extrato é filtrado

  @e2e
  Cenário: Valores de débito aparecem em vermelho com prefixo negativo
    Dado que existe pelo menos um lançamento de saída no extrato
    Então o valor de saída é exibido em vermelho
    E o valor é prefixado com "(−)"

  @e2e
  Cenário: Movimentações recentes aparecem na Home com descrição
    Dado que realizei uma transação com descrição "Movimentacao Home Cypress"
    Quando navego para a Home
    Então vejo "Movimentacao Home Cypress" no painel de movimentações recentes

  @api
  Cenário: Extrato retorna dados paginados via API
    Quando faço GET em /accounts/statement?page=1&limit=10 com token válido
    Então recebo o status HTTP 200
    E o corpo contém a propriedade "balance"
    E o corpo contém a propriedade "entries" como array
