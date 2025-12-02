import Fastify, { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { env } from './config/env';
import prismaPlugin from './plugins/prisma.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import { AppError } from './utils/errors/custom-errors';

export async function buildApp(): Promise<FastifyInstance> {
  // creer le serveur fastify
  const server = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
    
  });

  // Register CORS
  await server.register(cors, {
    origin: env.CORS_ORIGIN,// pour le moment le frontend est sur localhost:4200, et bien sur elle est dans le .env 
    credentials: true,
  });

  // Register Cookie support
  await server.register(cookie);



  // clé pour les tokens 
  await server.register(jwt, {
    secret: env.JWT_SECRET, // cle secrete pour signer les tokens 
    sign: {
      expiresIn: '7d', // les tokens expirent dans 7 jours
    },
  });

  // Register plugins
  await server.register(prismaPlugin);// connexion a la base de donnnes
  await server.register(swaggerPlugin);// documentation API



  // Health revision route 
  server.get('/health', async () => {
    return {
      status: 'OK',
      message: 'Festival App API is running',
      timestamp: new Date().toISOString(),
    };
  });

  // enregistrer les routes
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(usersRoutes, { prefix: '/api/users' });

  // Error handler
  server.setErrorHandler((error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }

    // Log unexpected errors
    server.log.error(error);

    // on va eviter d'exposer les erreur en prod 
    const message = env.NODE_ENV === 'development' ? error.message : 'Internal server error';

    return reply.code(error.statusCode || 500).send({
      success: false,
      error: message,
    });
  });

  // 404 handler
  server.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: 'Route not found',
      path: request.url,
    });
  });

  return server;
}
