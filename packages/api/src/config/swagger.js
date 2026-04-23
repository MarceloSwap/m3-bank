module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'M3 Bank API',
    version: '1.0.0',
    description: 'API REST e GraphQL do M3 Bank com autenticação, cadastro, transferências, Pix simulado e extrato paginado.'
  },
  servers: [
    {
      url: 'http://localhost:3333/api',
      description: 'Servidor local REST'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Realiza o login do usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'ana.juruti@m3bank.test' },
                  password: { type: 'string', example: 'amazonia123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login realizado com sucesso' },
          400: { description: 'Campos obrigatórios ausentes' },
          401: { description: 'Credenciais inválidas, token adulterado ou bloqueio por tentativas' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Cadastra um novo correntista',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'confirmPassword', 'cpf', 'createWithBalance'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  confirmPassword: { type: 'string' },
                  cpf: { type: 'string' },
                  createWithBalance: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Conta criada com sucesso' },
          400: { description: 'Falha de validação ou e-mail já cadastrado' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/accounts/me': {
      get: {
        summary: 'Retorna os dados da conta autenticada',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Conta encontrada' },
          401: { description: 'Token inválido ou expirado' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/accounts': {
      get: {
        summary: 'Lista as contas ativas disponíveis',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista retornada com sucesso' },
          401: { description: 'Token inválido ou expirado' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/accounts/statement': {
      get: {
        summary: 'Retorna o extrato paginado da conta autenticada',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'periodDays', in: 'query', schema: { type: 'integer', enum: [7, 15, 30], default: 30 } }
        ],
        responses: {
          200: { description: 'Extrato retornado com sucesso' },
          401: { description: 'Token inválido ou expirado' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/transfers': {
      post: {
        summary: 'Realiza uma transferência entre contas',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['accountNumber', 'accountDigit', 'amount', 'description'],
                properties: {
                  accountNumber: { type: 'string' },
                  accountDigit: { type: 'string' },
                  amount: { type: 'number', example: 150.5 },
                  description: { type: 'string' },
                  authorizationToken: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Transferência realizada com sucesso' },
          400: { description: 'Falha de validação, saldo insuficiente, limite excedido ou autotransferência' },
          401: { description: 'Token JWT inválido/expirado ou token especial ausente para valores acima de R$ 5.000,00' },
          404: { description: 'Conta de destino não encontrada ou inativa' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/payments/pix/simulate': {
      post: {
        summary: 'Simula um pagamento Pix por QR Code estático',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 49.9 },
                  description: { type: 'string', example: 'Pix simulado de teste' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Pagamento Pix simulado realizado com sucesso' },
          400: { description: 'Valor inválido ou saldo insuficiente' },
          401: { description: 'Token inválido ou expirado' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    }
  }
};
