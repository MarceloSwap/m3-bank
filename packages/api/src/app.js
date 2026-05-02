const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');
const env = require('./config/env');
const swaggerDocument = require('./config/swagger');
const { ensureDatabaseStructure } = require('./db/schema');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transferRoutes = require('./routes/transferRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const depositRoutes = require('./routes/depositRoutes');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const graphqlContext = require('./graphql/context');
const errorMiddleware = require('./middleware/errorMiddleware');

async function start() {
  await ensureDatabaseStructure();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      tryItOutEnabled: false
    },
    customCss: `
      .swagger-ui .opblock-summary-description { font-weight: 600; }
      .swagger-ui .response-col_status { font-weight: 700; font-size: 1rem; }
      .swagger-ui table.responses-table { display: table !important; }
      .swagger-ui .responses-inner { display: block !important; }
      .swagger-ui .opblock.is-open .opblock-body { display: block !important; }
    `
  }));
  app.use('/api/auth', authRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/transfers', transferRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/deposits', depositRoutes);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => ({
      message: error.originalError?.message || error.message
    })
  });

  await apolloServer.start();
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      context: graphqlContext
    })
  );

  app.use(errorMiddleware);

  app.listen(env.port, () => {
    console.log(`M3 Bank API disponível em http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Falha ao iniciar a API', error);
  process.exit(1);
});
