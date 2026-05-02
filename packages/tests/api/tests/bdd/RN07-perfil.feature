# language: pt

Funcionalidade: RN07 - Perfil do Usuário
  Como um usuário autenticado no M3 Bank
  Quero gerenciar meus dados pessoais e senha
  Para manter minha conta segura e atualizada

  Contexto:
    Dado que estou autenticado
    E estou na tela de Perfil

  @smoke @api @e2e
  Cenário: Atualizar nome com sucesso
    Dado que estou na aba "Alterar Nome"
    Quando preencho o campo "Nome completo" com "QA Nome Atualizado"
    E clico em "Atualizar Nome"
    Então vejo a mensagem "Nome atualizado com sucesso"
    E o novo nome é refletido na Home em tempo real

  @validacao @api @e2e
  Cenário: Nome com menos de 2 caracteres é bloqueado
    Dado que estou na aba "Alterar Nome"
    Quando preencho o campo "Nome completo" com "A"
    E clico em "Atualizar Nome"
    Então vejo a mensagem "Nome deve ter pelo menos 2 caracteres"

  @smoke @api @e2e
  Cenário: Alterar senha com sucesso
    Dado que estou na aba "Alterar Senha"
    Quando preencho a senha atual correta
    E preencho a nova senha com "Senha@654321"
    E confirmo a nova senha com "Senha@654321"
    E clico em "Salvar"
    Então vejo a mensagem "Senha alterada com sucesso"

  @validacao @e2e
  Cenário: Confirmação de senha divergente bloqueia a alteração
    Dado que estou na aba "Alterar Senha"
    Quando preencho a senha atual correta
    E preencho a nova senha com "Senha@654321"
    E confirmo a nova senha com "Senha@654321X"
    E clico em "Salvar"
    Então vejo a mensagem "As senhas nao coincidem"

  @seguranca @api @e2e
  Cenário: Senha atual incorreta bloqueia a alteração
    Dado que estou na aba "Alterar Senha"
    Quando preencho a senha atual com "SenhaErrada999"
    E preencho a nova senha com "Senha@654321"
    E confirmo a nova senha com "Senha@654321"
    E clico em "Salvar"
    Então recebo o status HTTP 400
    E a mensagem é "Senha atual incorreta"
