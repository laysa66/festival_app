import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { registerSwaggerSchema, loginSwaggerSchema, meSwaggerSchema } from '../validators/auth.validators';

export default async function authRoutes(server: FastifyInstance) {
  const authService = new AuthService(server);
  const authController = new AuthController(authService);

  // POST /api/auth/register
  server.post(
    '/register',
    {
      schema: registerSwaggerSchema,
    },
    async (request, reply) => {
      return authController.register(request, reply);
    }
  );

  //----------------------------
  // TRES IMPORTANT
  // POST /api/auth/login
  // structure d'une route 
  // schema : pour la documentation swagger
  // preHandler : les middlewares a executer avant d'appeler le controller
  server.post(
    '/login',
    {
      schema: loginSwaggerSchema, // ce qu'on attend dans le bodyyyy
    },
    async (request, reply) => {
      return authController.login(request, reply);
    }
  );

  // GET /api/auth/me
  server.get(
    '/me',
    {
      schema: meSwaggerSchema,
      preHandler: authMiddleware, // route protection, on verifie le token avant de passer ici 
    },
    async (request, reply) => {
      return authController.getMe(request, reply);
    }
  );

  // POST /api/auth/logout
  server.post(
    '/logout',
    {
      schema: {
        tags: ['auth'], // categorie dans swagger 
        summary: 'Se déconnecter',
        response: {
          200: { // ce qu'on renvoie en cas de succes 
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      return authController.logout(request, reply);
    }
  );
}
