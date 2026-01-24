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

export interface UsersListResponse {
  success: boolean;
  users: UserListItem[];
  total: number;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: UserListItem;
}
