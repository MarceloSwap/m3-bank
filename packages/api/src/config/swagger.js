const env = require('./env');

// ─── Schemas reutilizáveis ────────────────────────────────────────────────────

const ErrorResponse = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string', example: 'Mensagem de erro amigável' }
  }
};

const error400 = (example) => ({
  description: 'Bad Request — dados inválidos ou regra de negócio violada',
  content: { 'application/json': { schema: ErrorResponse, example: { message: example } } }
});

const error401 = (example = 'Token inválido ou expirado') => ({
  description: 'Unauthorized — token ausente, inválido ou expirado',
  content: { 'application/json': { schema: ErrorResponse, example: { message: example } } }
});

const error404 = (example) => ({
  description: 'Not Found — recurso não encontrado',
  content: { 'application/json': { schema: ErrorResponse, example: { message: example } } }
});

const bearerSecurity = [{ bearerAuth: [] }];

// ─── Documento principal ──────────────────────────────────────────────────────

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'M3 Bank API',
    version: '2.0.0',
    description: `
## M3 Bank — Documentação Completa

API REST do M3 Bank com autenticação JWT, cadastro, transferências, depósitos, Pix simulado, extrato paginado e perfil do usuário.

### Autenticação
Todas as rotas marcadas com 🔒 exigem o header:
\`\`\`
Authorization: Bearer <token>
\`\`\`
O token é obtido em **POST /auth/login** e expira em **1 hora**.

### Padrão de Erros
Todos os erros retornam o schema \`ErrorResponse\`:
\`\`\`json
{ "message": "Descrição do erro" }
\`\`\`

### Regras de Limite — Transferências
| Período | Horário | Limite máximo |
|---------|---------|---------------|
| Diurno  | 06h00–19h59 | R$ 10.000,00 |
| Noturno | 20h00–05h59 | R$ 1.000,00  |

Transferências acima de **R$ 5.000,00** exigem \`authorizationToken: "123456"\`.
    `.trim()
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api`,
      description: 'Servidor local REST'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido em POST /auth/login. Expira em 1 hora.'
      }
    },
    schemas: {
      ErrorResponse,

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email', example: 'ana.juruti@m3bank.test' },
          password: { type: 'string', minLength: 6,    example: 'amazonia123' }
        }
      },

      LoginResponse: {
        type: 'object',
        properties: {
          token:     { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          expiresIn: { type: 'integer', example: 3600 },
          user: {
            type: 'object',
            properties: {
              id:    { type: 'integer', example: 1 },
              name:  { type: 'string',  example: 'Ana Juruti' },
              email: { type: 'string',  example: 'ana.juruti@m3bank.test' }
            }
          },
          account: {
            type: 'object',
            properties: {
              id:      { type: 'integer', example: 1 },
              number:  { type: 'string',  example: '100001' },
              digit:   { type: 'string',  example: '7' },
              balance: { type: 'number',  example: 3350.00 }
            }
          }
        }
      },

      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword', 'cpf', 'createWithBalance'],
        properties: {
          name:              { type: 'string',  minLength: 1, example: 'Ana Juruti' },
          email:             { type: 'string',  format: 'email', example: 'ana.juruti@m3bank.test' },
          password:          { type: 'string',  minLength: 6, example: 'amazonia123' },
          confirmPassword:   { type: 'string',  minLength: 6, example: 'amazonia123' },
          cpf:               { type: 'string',  example: '18233456001' },
          createWithBalance: { type: 'boolean', example: true, description: 'true = saldo inicial R$ 1.000,00 | false = R$ 0,00' }
        }
      },

      RegisterResponse: {
        type: 'object',
        properties: {
          message:       { type: 'string',  example: 'Conta criada com sucesso' },
          accountNumber: { type: 'string',  example: '100001' },
          accountDigit:  { type: 'string',  example: '7' },
          initialBalance:{ type: 'number',  example: 1000 }
        }
      },

      ProfileRequest: {
        type: 'object',
        description: 'Envie `name` para alterar o nome, ou `currentPassword` + `newPassword` para alterar a senha. Não envie `confirmNewPassword` — o backend ignora esse campo.',
        properties: {
          name:            { type: 'string', minLength: 2, example: 'Ana Juruti Atualizada' },
          currentPassword: { type: 'string', example: 'amazonia123' },
          newPassword:     { type: 'string', minLength: 6, example: 'novaSenha456' }
        }
      },

      AccountData: {
        type: 'object',
        properties: {
          id:      { type: 'integer', example: 1 },
          number:  { type: 'string',  example: '100001' },
          digit:   { type: 'string',  example: '7' },
          balance: { type: 'number',  example: 3350.00 },
          active:  { type: 'boolean', example: true },
          owner: {
            type: 'object',
            properties: {
              name:  { type: 'string', example: 'Ana Juruti' },
              email: { type: 'string', example: 'ana.juruti@m3bank.test' },
              cpf:   { type: 'string', example: '18233456001' }
            }
          }
        }
      },

      AccountListItem: {
        type: 'object',
        properties: {
          id:         { type: 'integer', example: 1 },
          number:     { type: 'string',  example: '100001' },
          digit:      { type: 'string',  example: '7' },
          balance:    { type: 'number',  example: 3350.00 },
          active:     { type: 'boolean', example: true },
          ownerName:  { type: 'string',  example: 'Ana Juruti' },
          ownerEmail: { type: 'string',  example: 'ana.juruti@m3bank.test' }
        }
      },

      StatementEntry: {
        type: 'object',
        properties: {
          id:             { type: 'integer', example: 10 },
          date:           { type: 'string',  format: 'date-time', example: '2026-05-01T14:30:00.000Z' },
          type:           { type: 'string',  enum: ['Abertura de conta', 'Transferência enviada', 'Transferência recebida', 'Depósito', 'Pagamento Pix'] },
          description:    { type: 'string',  example: 'Pagamento da pizza', description: 'Exibe "-" quando não informado' },
          amount:         { type: 'number',  example: 150.00 },
          direction:      { type: 'string',  enum: ['credit', 'debit'], description: 'credit = entrada (verde) | debit = saída (vermelho)' },
          relatedAccount: { type: 'string',  example: '100002-4', nullable: true },
          favoredName:    { type: 'string',  example: 'Bruno Solimoes', nullable: true },
          receiverName:   { type: 'string',  example: 'Bruno Solimoes', nullable: true },
          receiverAccount:{ type: 'string',  example: '100002-4', nullable: true }
        }
      },

      StatementResponse: {
        type: 'object',
        properties: {
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          total:      { type: 'integer', example: 5 },
          periodDays: { type: 'integer', example: 30, description: 'Aceita apenas 7, 15 ou 30. Outros valores usam padrão 30.' },
          balance:    { type: 'number',  example: 3350.00 },
          entries:    { type: 'array',   items: { $ref: '#/components/schemas/StatementEntry' } }
        }
      },

      TransferRequest: {
        type: 'object',
        required: ['accountNumber', 'accountDigit', 'amount', 'description'],
        properties: {
          accountNumber:      { type: 'string',  example: '100002', description: 'Apenas números' },
          accountDigit:       { type: 'string',  example: '4',      description: 'Apenas números' },
          amount:             { type: 'number',  minimum: 10,       example: 150.00, description: 'Mínimo R$ 10,00. Diurno: máx R$ 10.000. Noturno (20h-05h59): máx R$ 1.000.' },
          description:        { type: 'string',  example: 'Pagamento aluguel' },
          authorizationToken: { type: 'string',  example: '123456', description: 'Obrigatório quando amount > R$ 5.000,00. Valor correto: "123456".' }
        }
      },

      TransferResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Transferência realizada com sucesso' },
          balance: { type: 'number', example: 3200.00, description: 'Novo saldo da conta de origem' }
        }
      },

      DepositRequest: {
        type: 'object',
        required: ['accountNumber', 'accountDigit', 'amount', 'description'],
        properties: {
          accountNumber: { type: 'string', example: '100001', description: 'Apenas números' },
          accountDigit:  { type: 'string', example: '7',      description: 'Apenas números' },
          amount:        { type: 'number', minimum: 10, maximum: 10000, example: 500.00, description: 'Mínimo R$ 10,00 | Máximo R$ 10.000,00' },
          description:   { type: 'string', example: 'Depósito mensal' }
        }
      },

      DepositResponse: {
        type: 'object',
        properties: {
          message:    { type: 'string', example: 'Depósito de R$ 500,00 realizado com sucesso na conta 100001-7' },
          newBalance: { type: 'number', example: 3850.00, description: 'Novo saldo da conta destino' }
        }
      },

      PixRequest: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount:      { type: 'number', example: 25.00, description: 'Deve ser maior que 0' },
          description: { type: 'string', example: 'Pagamento Pix simulado', description: 'Opcional — padrão: "Pagamento Pix simulado"' }
        }
      },

      PixResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Pagamento Pix simulado realizado com sucesso' },
          balance: { type: 'number', example: 3325.00, description: 'Novo saldo após o débito' }
        }
      }
    }
  },

  paths: {

    // ── AUTH ──────────────────────────────────────────────────────────────────

    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Login do usuário',
        description: 'Autentica o usuário e retorna um token JWT válido por 1 hora. Após 3 tentativas falhas consecutivas, a conta é bloqueada por 5 minutos.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } }
          },
          400: error400('Usuário e senha precisam ser preenchidos'),
          401: {
            description: 'Unauthorized — credenciais inválidas ou conta bloqueada',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  credenciais_invalidas: { summary: 'E-mail ou senha incorretos', value: { message: 'Credenciais inválidas' } },
                  conta_bloqueada:       { summary: 'Bloqueio por tentativas', value: { message: 'Muitas tentativas falhas. Tente novamente em 5 minutos.' } }
                }
              }
            }
          }
        }
      }
    },

    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastro de novo correntista',
        description: 'Cria um novo usuário e conta bancária. Com `createWithBalance: true` a conta inicia com R$ 1.000,00.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: {
          201: {
            description: 'Conta criada com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' } } }
          },
          400: {
            description: 'Bad Request — validação de campos',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  nome_vazio:        { summary: 'Nome ausente',              value: { message: 'Nome não pode ser vazio' } },
                  email_vazio:       { summary: 'E-mail ausente',            value: { message: 'Email não pode ser vazio' } },
                  senha_vazia:       { summary: 'Senha ausente',             value: { message: 'Senha não pode ser vazio' } },
                  confirmar_vazio:   { summary: 'Confirmação ausente',       value: { message: 'Confirmar senha não pode ser vazio' } },
                  cpf_vazio:         { summary: 'CPF ausente',               value: { message: 'CPF é obrigatório' } },
                  email_invalido:    { summary: 'Formato de e-mail inválido',value: { message: 'Formato de e-mail inválido' } },
                  senha_curta:       { summary: 'Senha com menos de 6 chars',value: { message: 'Senha deve conter no mínimo 6 caracteres' } },
                  senhas_diferentes: { summary: 'Senhas não coincidem',      value: { message: 'As senhas precisam ser iguais' } },
                  email_duplicado:   { summary: 'E-mail já cadastrado',      value: { message: 'E-mail já cadastrado' } }
                }
              }
            }
          }
        }
      }
    },

    '/auth/profile': {
      put: {
        tags: ['Autenticação'],
        summary: 'Atualiza nome ou senha do usuário',
        description: 'Envie `name` para alterar o nome (mínimo 2 caracteres). Envie `currentPassword` + `newPassword` para alterar a senha. **Nota:** o campo `confirmNewPassword` é ignorado pelo backend.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfileRequest' } } }
        },
        responses: {
          200: {
            description: 'Perfil atualizado com sucesso',
            content: { 'application/json': { schema: ErrorResponse, example: { message: 'Perfil atualizado com sucesso' } } }
          },
          400: {
            description: 'Bad Request — validação de campos',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  nome_vazio:          { summary: 'Nome vazio',                    value: { message: 'Nome não pode ser vazio' } },
                  nome_curto:          { summary: 'Nome com menos de 2 caracteres',value: { message: 'Nome deve ter pelo menos 2 caracteres' } },
                  senha_atual_obrig:   { summary: 'Senha atual ausente',           value: { message: 'Senha atual é obrigatória' } },
                  senha_atual_errada:  { summary: 'Senha atual incorreta',         value: { message: 'Senha atual incorreta' } },
                  nova_senha_obrig:    { summary: 'Nova senha ausente',            value: { message: 'Nova senha é obrigatória' } },
                  nova_senha_curta:    { summary: 'Nova senha com menos de 6 chars',value: { message: 'Nova senha deve ter pelo menos 6 caracteres' } }
                }
              }
            }
          },
          401: error401(),
          404: error404('Usuário não encontrado')
        }
      }
    },

    // ── ACCOUNTS ─────────────────────────────────────────────────────────────

    '/accounts/me': {
      get: {
        tags: ['Contas'],
        summary: 'Dados da conta autenticada',
        description: 'Retorna número, dígito, saldo e dados do titular da conta do usuário logado.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Conta encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AccountData' } } }
          },
          401: error401(),
          404: error404('Conta não encontrada')
        }
      }
    },

    '/accounts': {
      get: {
        tags: ['Contas'],
        summary: 'Lista todas as contas ativas',
        description: '⚠️ **DEF-004 (BOLA/IDOR):** qualquer token válido retorna dados de todos os usuários. Usado pela UI para popular a lista de favorecidos em transferências e depósitos.',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accounts: { type: 'array', items: { $ref: '#/components/schemas/AccountListItem' } }
                  }
                }
              }
            }
          },
          401: error401()
        }
      }
    },

    '/accounts/statement': {
      get: {
        tags: ['Contas'],
        summary: 'Extrato paginado da conta autenticada',
        description: 'Retorna lançamentos paginados com saldo atual. `periodDays` aceita apenas **7**, **15** ou **30** — outros valores usam padrão 30.',
        security: bearerSecurity,
        parameters: [
          { name: 'page',       in: 'query', description: 'Página atual (padrão: 1)',                                    schema: { type: 'integer', default: 1,  minimum: 1 } },
          { name: 'limit',      in: 'query', description: 'Itens por página (padrão: 10)',                               schema: { type: 'integer', default: 10, minimum: 1 } },
          { name: 'periodDays', in: 'query', description: 'Período em dias. Aceita: 7, 15 ou 30 (padrão: 30)',           schema: { type: 'integer', default: 30, enum: [7, 15, 30] } }
        ],
        responses: {
          200: {
            description: 'Extrato retornado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StatementResponse' } } }
          },
          401: error401(),
          404: error404('Conta não encontrada')
        }
      }
    },

    // ── TRANSFERS ─────────────────────────────────────────────────────────────

    '/transfers': {
      post: {
        tags: ['Transferências'],
        summary: 'Realiza uma transferência entre contas',
        description: `
**Regras de negócio:**
- Valor mínimo: **R$ 10,00**
- Limite diurno (06h–19h59): **R$ 10.000,00**
- Limite noturno (20h–05h59): **R$ 1.000,00**
- Acima de **R$ 5.000,00**: campo \`authorizationToken\` obrigatório com valor \`"123456"\`
- Não é permitido transferir para a própria conta
- Conta destino deve existir e estar ativa
- Saldo deve ser suficiente
- Em caso de falha: **rollback automático**
        `.trim(),
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TransferRequest' } } }
        },
        responses: {
          201: {
            description: 'Transferência realizada com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TransferResponse' } } }
          },
          400: {
            description: 'Bad Request — regra de negócio violada',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  conta_invalida_payload:  { summary: 'Número/dígito ausente ou não numérico', value: { message: 'Conta inválida ou inexistente' } },
                  descricao_obrigatoria:   { summary: 'Descrição ausente',                     value: { message: 'Descrição é obrigatória' } },
                  valor_minimo:            { summary: 'Valor abaixo de R$ 10,00',              value: { message: 'Valor mínimo para transferência é de R$ 10,00' } },
                  limite_noturno:          { summary: 'Acima do limite noturno (R$ 1.000)',    value: { message: 'Valor excede o limite noturno permitido' } },
                  limite_diurno:           { summary: 'Acima do limite diurno (R$ 10.000)',    value: { message: 'Valor excede o limite máximo permitido para transferência' } },
                  propria_conta:           { summary: 'Anti-fraude: própria conta',            value: { message: 'Não é possível transferir para a própria conta' } },
                  saldo_insuficiente:      { summary: 'Saldo insuficiente',                    value: { message: 'Saldo insuficiente para realizar a transferência' } }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized — token inválido ou token de autorização incorreto',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  token_jwt_invalido:   { summary: 'JWT ausente ou expirado',          value: { message: 'Token inválido ou expirado' } },
                  token_autorizacao:    { summary: 'Token de autorização incorreto',   value: { message: 'Token de autorização inválido' } }
                }
              }
            }
          },
          404: error404('Conta inválida ou inexistente')
        }
      }
    },

    // ── DEPOSITS ──────────────────────────────────────────────────────────────

    '/deposits': {
      post: {
        tags: ['Depósitos'],
        summary: 'Realiza um depósito em conta ativa',
        description: `
**Regras de negócio:**
- Valor mínimo: **R$ 10,00**
- Valor máximo: **R$ 10.000,00**
- Conta destino deve existir e estar ativa
- Saldo é creditado imediatamente
- Em caso de falha: **rollback automático**
        `.trim(),
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DepositRequest' } } }
        },
        responses: {
          201: {
            description: 'Depósito realizado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DepositResponse' } } }
          },
          400: {
            description: 'Bad Request — regra de negócio violada',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  conta_invalida_payload: { summary: 'Número/dígito ausente ou não numérico', value: { message: 'Conta inválida ou inexistente' } },
                  descricao_obrigatoria:  { summary: 'Descrição ausente',                     value: { message: 'Descrição é obrigatória' } },
                  valor_minimo:           { summary: 'Valor abaixo de R$ 10,00',              value: { message: 'Valor mínimo para depósito é de R$ 10,00' } },
                  valor_maximo:           { summary: 'Valor acima de R$ 10.000,00',           value: { message: 'Valor máximo para depósito é de R$ 10.000,00' } }
                }
              }
            }
          },
          401: error401(),
          404: error404('Conta inválida ou inexistente')
        }
      }
    },

    // ── PIX ───────────────────────────────────────────────────────────────────

    '/payments/pix/simulate': {
      post: {
        tags: ['Pix Simulado'],
        summary: 'Simula um pagamento Pix',
        description: `
**Regras de negócio:**
- Valor deve ser maior que **R$ 0,00**
- Saldo deve ser suficiente
- \`description\` é opcional — padrão: \`"Pagamento Pix simulado"\`
- Gera lançamento \`"Pagamento Pix"\` com \`direction: "debit"\` no extrato
- Nenhuma integração bancária real é realizada
- Em caso de falha: **rollback automático**
        `.trim(),
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PixRequest' } } }
        },
        responses: {
          201: {
            description: 'Pagamento Pix simulado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PixResponse' } } }
          },
          400: {
            description: 'Bad Request — regra de negócio violada',
            content: {
              'application/json': {
                schema: ErrorResponse,
                examples: {
                  valor_invalido:     { summary: 'Valor zero ou negativo',  value: { message: 'Informe um valor válido para o pagamento' } },
                  saldo_insuficiente: { summary: 'Saldo insuficiente',      value: { message: 'Saldo insuficiente para realizar o pagamento' } }
                }
              }
            }
          },
          401: error401(),
          404: error404('Conta não encontrada')
        }
      }
    }
  }
};
