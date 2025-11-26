export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  valide: boolean;
}

export enum UserRole {
  PUBLIC = 'PUBLIC',
  USER = 'USER',
  BENEVOLE = 'BENEVOLE',
  ORGANISATEUR = 'ORGANISATEUR',
  SUPER_ORGANISATEUR = 'SUPER_ORGANISATEUR',
  ADMIN = 'ADMIN'
}
