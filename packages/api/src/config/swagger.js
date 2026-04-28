const env = require('./env');

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'M3 Bank API',
    version: '1.0.0',
    description: 'API REST e GraphQL do M3 Bank com autenticação, cadastro, transferências, depósitos, Pix simulado, extrato paginado e perfil do usuário.'
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
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Mensagem de erro amigável' }
        }
      },
      AccountData: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 43 },
          number: { type: 'string', example: '100043' },
          digit: { type: 'string', example: '1' },
          balance: { type: 'number', example: 150.50 },
          active: { type: 'boolean', example: true },
          owner: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Marcelo Ferreira' },
              email: { type: 'string', example: 'marcelo@m3bank.com' },
              cpf: { type: 'string', example: '11199922288' }
            }
          }
        }
      },
      StatementEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 105 },
          date: { type: 'string', format: 'date-time' },
          type: { type: 'string', enum: ['Abertura de conta', 'Transferência enviada', 'Transferência recebida', 'Depósito', 'Pagamento Pix'] },
          amount: { type: 'number', example: 50.00 },
          description: { type: 'string', example: 'Pagamento da pizza' },
          favoredName: { type: 'string', example: 'Carlos Silva' },
          favoredAccount: { type: 'string', example: '100012-5' }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Realiza o login do usuário',
        description: 'Campos obrigatórios: email e senha.',
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
          401: { description: 'Credenciais inválidas' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
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
          201: { description: 'Conta criada com sucesso' }
        }
      }
    },
    '/auth/profile': {
      put: {
        tags: ['Autenticação'],
        summary: 'Atualiza o perfil do usuário (nome ou senha)',
        description: 'Rota real implementada no authRoutes.js do backend.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2 },
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                  confirmNewPassword: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Perfil atualizado com sucesso' },
          401: { description: 'Senha atual incorreta ou token inválido' },
          404: { description: 'Usuário não encontrado' }
        }
      }
    },
    '/accounts/me': {
      get: {
        tags: ['Contas e Perfil'],
        summary: 'Retorna os dados da conta autenticada',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Conta encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AccountData' }
              }
            }
          }
        }
      }
    },
    '/accounts': {
      get: {
        tags: ['Contas e Perfil'],
        summary: 'Lista as contas ativas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista retornada com sucesso' }
        }
      }
    },
    '/accounts/statement': {
      get: {
        tags: ['Contas e Perfil'],
        summary: 'Retorna o extrato paginado',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'periodDays', in: 'query', schema: { type: 'integer', default: 30 } }
        ],
        responses: {
          200: { description: 'Extrato retornado com sucesso' }
        }
      }
    },
    '/transfers': {
      post: {
        tags: ['Transações'],
        summary: 'Realiza uma transferência',
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
                  amount: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Transferência realizada' }
        }
      }
    },
    '/deposits': {
      post: {
        tags: ['Transações'],
        summary: 'Realiza um depósito',
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
                  amount: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Depósito realizado' }
        }
      }
    },
    '/payments/pix/simulate': {
      post: {
        tags: ['Pix'],
        summary: 'Simula um pagamento Pix',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Pix realizado' }
        }
      }
    }
  }
};