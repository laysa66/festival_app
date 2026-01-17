import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserListItem, UpdateUserRequest, Role } from '../models/user-management.interface';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3000/api';

  getRoles(): Role[] {
    return [
      { id: 1, type: 'PUBLIC' },
      { id: 2, type: 'USER' },
      { id: 3, type: 'BENEVOLE' },
      { id: 4, type: 'ORGANISATEUR' },
      { id: 5, type: 'SUPER_ORGANISATEUR' },
      { id: 6, type: 'ADMIN' }
    ];
  }

  getUsers(): Observable<{ success: boolean; users: UserListItem[]; total: number }> {
    return this.http.get<{ success: boolean; users: UserListItem[]; total: number }>(`${this.API_URL}/users`);
  }

  updateUser(userId: number, data: UpdateUserRequest): Observable<{ success: boolean; message: string; user: UserListItem }> {
    return this.http.put<{ success: boolean; message: string; user: UserListItem }>(`${this.API_URL}/users/${userId}`, data);
  }
}
