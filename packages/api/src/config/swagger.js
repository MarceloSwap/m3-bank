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
          message: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          cpf: { type: 'string' },
          accountNumber: { type: 'string' },
          accountDigit: { type: 'string' },
          balance: { type: 'number' }
        }
      },
      StatementEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          date: { type: 'string', format: 'date-time' },
          type: { type: 'string', enum: ['Abertura de conta', 'Transferência enviada', 'Transferência recebida', 'Depósito', 'Pagamento Pix'] },
          amount: { type: 'number' },
          description: { type: 'string' },
          favoredName: { type: 'string' },
          favoredAccount: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Realiza o login do usuário',
        description: 'Campos obrigatórios: email e senha. Após 3 tentativas falhas, bloqueio por 5 minutos.',
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
          200: { description: 'Login realizado com sucesso, redireciona para Home' },
          400: { description: 'Campos obrigatórios ausentes: "Usuário e senha precisam ser preenchidos"' },
          401: { description: 'Credenciais inválidas ou bloqueio: "Muitas tentativas falhas. Tente novamente em 5 minutos." ou token expirado (1 hora)' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Cadastra um novo correntista',
        description: 'Campos obrigatórios: nome, email, senha, confirmação de senha, cpf. Senha mínimo 6 caracteres. Saldo inicial opcional (R$ 1000 se marcado).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'confirmPassword', 'cpf', 'createWithBalance'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  confirmPassword: { type: 'string' },
                  cpf: { type: 'string' },
                  createWithBalance: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Conta criada com sucesso, exibe número da conta' },
          400: { description: 'Validações: nome vazio, email inválido, senha fraca, senhas não coincidem' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/accounts/me': {
      get: {
        summary: 'Retorna os dados da conta autenticada',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Conta encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          401: { description: 'Token inválido ou expirado' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro interno do servidor' }
        }
      },
      put: {
        summary: 'Atualiza o perfil do usuário (nome ou senha)',
        description: 'Para alterar senha, informar senha atual. Nome mínimo 2 caracteres.',
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
          400: { description: 'Validações falharam' },
          401: { description: 'Token inválido ou senha atual incorreta' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/accounts': {
      get: {
        summary: 'Lista as contas ativas disponíveis para transferência',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista retornada com sucesso, excluindo conta própria' },
          401: { description: 'Token inválido ou expirado' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/accounts/statement': {
      get: {
        summary: 'Retorna o extrato paginado da conta autenticada',
        description: 'Filtros por período: 7, 15, 30 dias. Cada registro inclui data/hora, tipo, valor, descrição, favorecido e conta.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'periodDays', in: 'query', schema: { type: 'integer', enum: [7, 15, 30], default: 30 } }
        ],
        responses: {
          200: {
            description: 'Extrato retornado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    balance: { type: 'number' },
                    entries: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/StatementEntry' }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Token inválido ou expirado' },
          404: { description: 'Conta não encontrada' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/transfers': {
      post: {
        summary: 'Realiza uma transferência entre contas',
        description: 'Valor mínimo R$ 10. Limite diurno R$ 10.000, noturno R$ 1.000. Token 123456 para > R$ 5.000. Não para própria conta.',
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
                  amount: { type: 'number', minimum: 10 },
                  description: { type: 'string' },
                  authorizationToken: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Transferência realizada com sucesso' },
          400: { description: 'Validações: conta inválida, saldo insuficiente, limite excedido, autotransferência' },
          401: { description: 'Token JWT inválido/expirado ou token especial ausente' },
          404: { description: 'Conta de destino não encontrada ou inativa' },
          500: { description: 'Erro interno do servidor' }
        }
      }
    },
    '/deposits': {
      post: {
        summary: 'Realiza um depósito em uma conta',
        description: 'Valor entre R$ 1 e R$ 10.000. Crédito imediato.',
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
                  amount: { type: 'number', minimum: 1, maximum: 10000 },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Depósito realizado com sucesso' },
          400: { description: 'Validações: conta inválida, valor fora do limite' },
          401: { description: 'Token inválido ou expirado' },
          404: { description: 'Conta não encontrada ou inativa' },
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
                  amount: { type: 'number', minimum: 0.01 },
                  description: { type: 'string' }
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
