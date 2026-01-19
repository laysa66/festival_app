import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, LoginRequest } from '../models/auth.models';
import { registerBodySchema, loginBodySchema } from '../validators/auth.validators';

// Controller pour l'authentification

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = registerBodySchema.parse(request.body) as RegisterRequest;
      const result = await this.authService.register(data);
      return reply.code(201).send(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          success: false,
          error: error.errors[0].message,
        });
      }
      throw error;
    }
  }

  // --------------------------------------
  //fastifyrequest 

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      // valider les donnees d'entree avec zod
      const data = loginBodySchema.parse(request.body) as LoginRequest;

      // si valide il appel le serive 
      const result = await this.authService.login(data);
      
      // creer le cookie avec le token 
      reply.setCookie('auth_token', result.token!, {
        httpOnly: true,  // Inaccessible depuis JavaScript (plus sécurisé)
        secure: process.env.NODE_ENV === 'production', // HTTPS en production , donc true en prod et false en dev
        sameSite: 'lax', // Protection CSRF
        maxAge: 7 * 24 * 60 * 60, // le cookie expire dans 7 jours
        path: '/' // Disponible sur tout le site
      });
      
      // Renvoyer la réponse SANS le token (il est dans le cookie)
      const { token, ...responseWithoutToken } = result;
      return reply.code(200).send(responseWithoutToken);


    } catch (error: any) {
      if (error.name === 'ZodError') {
        return reply.code(400).send({
          success: false,
          error: error.errors[0].message,
        });
      }
      throw error;
    }
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Non authentifié',
      });
    }

    const user = await this.authService.getMe(request.user.userId);
    return reply.code(200).send({
      success: true,
      user,
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    // Supprimer le cookie
    reply.clearCookie('auth_token', { path: '/' });
    return reply.code(200).send({
      success: true,
      message: 'Déconnexion réussie'
    });
  }
}
