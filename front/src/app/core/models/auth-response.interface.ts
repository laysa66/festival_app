import { User } from './user.interface';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
