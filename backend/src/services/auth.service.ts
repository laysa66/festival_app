import { FastifyInstance } from 'fastify';
import { RegisterRequest, LoginRequest, UserResponse, AuthResponse } from '../models/auth.models';
import { hashPassword, comparePassword } from '../utils/password.util';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors/custom-errors';

export class AuthService {
  constructor(private server: FastifyInstance) {}

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.server.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(data.password);

    // Récupérer le rôle USER (id: 2)
    const userRole = await this.server.prisma.role.findUnique({
      where: { type: 'USER' },
    });

    if (!userRole) {
      throw new Error('Role USER not found');
    }

    // Créer l'utilisateur
    const user = await this.server.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        nom: data.nom,
        prenom: data.prenom,
        valide: false, // En attente de validation
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    return {
      success: true,
      message: 'Compte créé avec succès. En attente de validation par un administrateur.',
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role.type,
        valide: user.valide,
      },
    };
  }
  // --------------------------------------
  // fonction de login
  // interface LoginRequest 
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Trouver l'utilisateur
    const user = await this.server.prisma.user.findUnique({// dans prisma findunique cherche un seul et unique utilisateur 
      where: { email: data.email }, // on va chercher le user avec son email
      include: { role: true }, // et on inclut son role
    });// ce qui est ecris ici est la meme chose que cette requete : SELECT users.*, roles.* FROM users LEFT JOIN roles ON users.roleId = roles.id WHERE users.email = 'user@example.com';

    if (!user) { // si on ne trouve pas l'utilisateur
      throw new UnauthorizedError('Email ou mot de passe incorrect'); 
    }

    // sinon on continue
    // Vérifier le mot de passe
    // on va comparer le mot de passe que le client a fourni avec le hash en base de donnees
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    // si le mot de passe est faux 
    if (!isPasswordValid) {
      throw new UnauthorizedError('mot de passe incorrect');
    }
    // si tout va bien on continue
    // Vérifier que le compte est validé
    // si le compte nest pas valider par l'admin , l'utilisateur a pas le droit de se connecter
    if (!user.valide) {
      throw new ForbiddenError('Compte non validé par un administrateur. Veuillez attendre l\'approbation.');
    }

    // si il a passer toutes les verifications
    // on va lui generer un token JWT
    // Générer le token JWT
    // on met dans le token : le userid, email et le role 
    const token = this.server.jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role.type,
    });
    // on renvoie ensuite la reponse 
    // retourne les donnnees 
    return {
      success: true,
      //TODO :supprimer le message que la connexion est reussi 
      message: 'Connexion réussie',
      token,
      // la reponse envoyer au client: 
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role.type,
        valide: user.valide,
      },
    };
  }

  async getMe(userId: number): Promise<UserResponse> {
    const user = await this.server.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role.type,
      valide: user.valide,
    };
  }
}
