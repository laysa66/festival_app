import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { swaggerConfig, swaggerUiConfig } from '../config/swagger';

// documentation automatique de l'api 
const swaggerPlugin: FastifyPluginAsync = async (server) => {
  await server.register(swagger, swaggerConfig);
  await server.register(swaggerUi, swaggerUiConfig);
};

export default fp(swaggerPlugin);
