# language: pt

Funcionalidade: RN02 - Login e Autenticação
  Como um usuário cadastrado no M3 Bank
  Quero fazer login com minhas credenciais
  Para acessar minha conta e realizar operações financeiras

  Contexto:
    Dado que estou na tela de login do M3 Bank

  @smoke @api @e2e
  Cenário: Login bem-sucedido com credenciais válidas
    Dado que existe uma conta cadastrada com e-mail "usuario@m3bank.test" e senha válida
    Quando informo o e-mail e a senha corretos
    E clico em "Acessar dashboard"
    Então sou redirecionado para a Home
    E um token JWT é armazenado no localStorage

  @validacao @e2e
  Cenário: Campos obrigatórios vazios
    Quando clico em "Acessar dashboard" sem preencher nenhum campo
    Então vejo a mensagem "Usuario e senha precisam ser preenchidos"

  @validacao @api @e2e
  Cenário: E-mail não cadastrado é rejeitado
    Quando informo um e-mail que não existe no sistema
    E clico em "Acessar dashboard"
    Então vejo a mensagem de erro de credenciais inválidas

  @validacao @api @e2e
  Cenário: Senha incorreta é rejeitada
    Dado que existe uma conta cadastrada com e-mail "usuario@m3bank.test"
    Quando informo o e-mail correto e uma senha errada
    E clico em "Acessar dashboard"
    Então vejo a mensagem de erro de credenciais inválidas

  @seguranca @api
  Cenário: Token JWT expirado retorna 401
    Dado que possuo um token JWT expirado
    Quando faço uma requisição autenticada com esse token
    Então recebo o status HTTP 401
    E a mensagem contém "Unauthorized" ou "Token inválido"

  @seguranca @api
  Cenário: Requisição sem token retorna 401
    Quando acesso uma rota protegida sem enviar o header Authorization
    Então recebo o status HTTP 401
    E o corpo da resposta contém a propriedade "message"
