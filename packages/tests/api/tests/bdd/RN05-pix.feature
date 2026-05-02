# language: pt

Funcionalidade: RN05 - Pagamentos (Pix Simulado)
  Como um usuário autenticado no M3 Bank
  Quero simular um pagamento via Pix
  Para testar o fluxo de débito e registro no extrato

  Contexto:
    Dado que estou autenticado com saldo disponível
    E estou na tela de Pagamentos

  @smoke @api @e2e
  Cenário: Simulação de pagamento Pix com sucesso
    Dado que a tela exibe um QR Code estático
    Quando informo o valor de R$ 25,00
    E informo uma descrição
    E clico em "Simular Leitura"
    Então vejo a confirmação do pagamento
    E o valor é debitado do saldo

  @e2e
  Cenário: Pagamento Pix registra saída no extrato
    Quando realizo um pagamento Pix de R$ 25,00 com descrição "Pix simulado Cypress"
    E retorno para a Home
    E navego para o Extrato
    Então vejo o lançamento "Pix simulado Cypress" no extrato
    E o valor aparece em vermelho com o prefixo "(−)"
