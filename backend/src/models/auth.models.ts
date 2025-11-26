export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

// ce que le client envoie pour se connecter 
export interface LoginRequest {
  email: string; // email 
  password: string;// password
}


// interface d'un  user 
export interface UserResponse {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  valide: boolean;
}
//TODO : le token a quooi comme role ici 
// ce que le backend renvoie apres connexion 
export interface AuthResponse {
  success: boolean; 
  message?: string;
  token?: string;
  user?: UserResponse;
  error?: string;
}
