# 1. Regras de Negócio e Requisitos

Este documento centraliza todas as regras de negócio, limites de sistema e comportamentos esperados do M3 Bank. Ele serve como a Fonte da Verdade (Source of Truth) para a automação de testes (Cypress, Supertest) e para as sessões de testes exploratórios.

## 1. Cadastro de Contas
Fluxo de entrada de novos usuários no M3 Bank.

- RN01.01: Os campos Nome, E-mail, Senha e Confirmação de senha são obrigatórios.
- RN01.02: Validações de campos vazios devem retornar as seguintes mensagens na interface:
  - "Nome não pode ser vazio"
  - "Email não pode ser vazio"
  - "Senha não pode ser vazio"
  - "Confirmar senha não pode ser vazio"
- RN01.03: As entradas de Senha e Confirmação de senha devem ser exatamente iguais.
- RN01.04: O formulário possui um toggle/checkbox chamado "Criar conta com saldo":
  - Se Ativo: A conta é criada com saldo inicial de R$ 1.000,00.
  - Se Inativo: A conta é criada com saldo inicial de R$ 0,00.
- RN01.05: O sucesso no cadastro deve exibir na tela o número da conta criada, que será usado para recebimento de transferências.
- RN01.06 (Validação): O campo e-mail deve validar o formato padrão. Entradas inválidas devem ser bloqueadas com a mensagem: "Formato de e-mail inválido".
- RN01.07 (Força da Senha): A senha deve conter no mínimo 6 caracteres.

## 2. Autenticação e Login
O acesso ao sistema é restrito e gerenciado via tokens JWT (JSON Web Tokens).

- RN02.01: Os campos E-mail e Senha são de preenchimento obrigatório.
- RN02.02: A tentativa de login com campos vazios deve exibir na UI a mensagem exata: "Usuário e senha precisam ser preenchidos".
- RN02.03: O sistema não deve autorizar o acesso de credenciais inválidas ou não cadastradas, retornando um erro de autenticação amigável.
- RN02.04: Após o login com sucesso, o usuário deve ser redirecionado automaticamente para a Home (Dashboard).
- RN02.05 (API): O token gerado no back-end possui um tempo de expiração estrito de 1 hora. Requisições com tokens expirados ou adulterados devem retornar erro HTTP 401 Unauthorized.
- RN02.06 (Segurança): Após 3 tentativas de login falhas consecutivas para o mesmo e-mail, o sistema deve exibir a mensagem: "Muitas tentativas falhas. Tente novamente em 5 minutos."

## 3. Transferências (Core Business)
Este é o módulo mais crítico do sistema e possui regras estritas de integridade.

- RN03.01: Transferências só podem ser enviadas para contas de destino que existam e estejam ativas. Caso contrário, exibir: "Conta inválida ou inexistente".
- RN03.02: Os campos numéricos (Número e Dígito da conta) devem aceitar apenas números.
- RN03.03: O campo Descrição é de preenchimento obrigatório.
- RN03.04 (Limites Mínimos): O valor mínimo para qualquer transferência é de R$ 10,00 (Tentativas menores ou negativas devem ser bloqueadas).
- RN03.05 (Autorização Especial): Transferências com valores acima de R$ 5.000,00 exigem um token de autorização específico (123456) enviado na requisição.
- RN03.06 (Saldo): O sistema deve validar se o saldo da conta de origem é maior ou igual ao valor da transferência antes de processar o débito.
- RN03.07: O sucesso da transação deve exibir: "Transferência realizada com sucesso", deduzir o valor do saldo em tempo real e redirecionar o usuário para a tela de Extrato.
- RN03.08 (Transações Síncronas): Em caso de falha no meio do processo, a transação não deve ser parcialmente concluída. Todo o processo deve ser revertido (Rollback).
- RN03.09 (Anti-Fraude): O sistema não deve permitir que a conta de origem seja a mesma da conta de destino. Caso ocorra, exibir: "Não é possível transferir para a própria conta".
- RN03.10 (Limite Dinâmico/Noturno): Por regras de segurança, o teto máximo de transferência varia conforme o horário da transação (fuso horário local):
  - Das 06h00 às 19h59 (Diurno): Limite máximo de R$ 10.000,00 por transação.
  - Das 20h00 às 05h59 (Noturno): Limite máximo cai para R$ 1.000,00 por transação. Valores superiores devem ser bloqueados com a mensagem: "Valor excede o limite noturno permitido".
- RN03.11 (Lista de Contas): A tela de transferências deve apresentar uma lista expansível com todas as contas ativas disponíveis para transferência, exibindo nome do titular e número da conta. A conta própria do usuário logado deve ser automaticamente excluída da lista.

## 4. Depósito Bancário
Funcionalidade para creditar valores em contas existentes.

- RN04.01: Depósitos só podem ser realizados para contas que existam e estejam ativas. Caso contrário, exibir: "Conta inválida ou inexistente".
- RN04.02: Os campos numéricos (Número e Dígito da conta) devem aceitar apenas números.
- RN04.03: O campo Descrição é de preenchimento obrigatório.
- RN04.04 (Limites):
  - Valor mínimo para depósito: R$ 1,00
  - Valor máximo para depósito: R$ 10.000,00
- RN04.05 (Processamento): O valor depositado deve ser creditado imediatamente no saldo da conta destino.
- RN04.06: O sucesso da operação deve exibir uma mensagem confirmando o depósito e o novo saldo, além de registrar a transação no extrato como "Depósito".
- RN04.07 (Transações Síncronas): Em caso de falha, a operação deve ser completamente revertida (Rollback).

## 5. Pagamentos (Pix Simulado)
Funcionalidade interativa para testes de fluxo de pagamento.

- RN05.01: A tela deve apresentar um QR Code estático (Mockado).
- RN05.02: O usuário deve informar um valor e clicar no botão "Simular Leitura".
- RN05.03: O sistema deve simular o processamento, validar se há saldo suficiente, debitar o valor correspondente e gerar um registro de saída no extrato, sem envolver integrações bancárias reais.

## 6. Extrato e Saldo
Visualização do histórico financeiro.

- RN06.01: O painel principal deve exibir o saldo disponível atualizado no momento do acesso.
- RN06.02 (API): A listagem do extrato deve ser suportada por paginação no back-end (limite de itens por página).
- RN06.03 (Formatação Visual): Cada registro deve exibir a data da realização e o tipo (Abertura de conta, Transferência enviada, Transferência recebida, Depósito).
- RN06.04 (Cores e Sinais):
  - Valores de Saída (Débito) devem ser renderizados na cor Vermelha e prefixados com sinal negativo (-).
  - Valores de Entrada (Crédito) devem ser renderizados na cor Verde.
- RN06.05: Transações sem comentário devem exibir um hífen (-) no lugar da descrição.
- RN06.06 (Filtros): O usuário deve ser capaz de filtrar o extrato através de botões de período rápido: "Últimos 7 dias", "Últimos 15 dias" e "Últimos 30 dias".

## 7. Perfil do Usuário
Gerenciamento de dados pessoais e configurações de segurança.

- RN07.01: O usuário deve poder alterar seu nome completo através de uma interface dedicada.
- RN07.02: O campo nome deve ter validação de mínimo 2 caracteres e não pode ser vazio.
- RN07.03: O usuário deve poder alterar sua senha, sendo obrigatório informar a senha atual para confirmação.
- RN07.04: A nova senha deve ter mínimo 6 caracteres e deve ser confirmada em um campo separado.
- RN07.05: Alterações de senha com senha atual incorreta devem ser bloqueadas com mensagem de erro.
- RN07.06: Sucesso nas alterações deve exibir mensagem de confirmação e atualizar os dados em tempo real.
- RN07.07 (Interface): A tela de perfil deve ser organizada em abas separadas para alteração de nome e senha.
