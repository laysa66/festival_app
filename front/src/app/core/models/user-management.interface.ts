export interface Role {
  id: number;
  type: string;
}

export interface UserListItem {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  valide: boolean;
  createdAt: string;
}

export interface UpdateUserRequest {
  valide?: boolean;
  roleId?: number;
}
