import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../core/services/user-management.service';
import { UserListItem, Role } from '../../core/models/user-management.interface';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  private userManagementService = inject(UserManagementService);
  private router = inject(Router);

  users = signal<UserListItem[]>([]);
  roles: Role[] = [];
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.roles = this.userManagementService.getRoles();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userManagementService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error || 'Erreur lors du chargement des utilisateurs');
        this.isLoading.set(false);
      }
    });
  }

  updateUser(userId: number, valide: boolean, roleId: number): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userManagementService.updateUser(userId, { valide, roleId }).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loadUsers();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error || 'Erreur lors de la mise à jour');
      }
    });
  }

  getRoleId(roleType: string): number {
    return this.roles.find(r => r.type === roleType)?.id || 2;
  }
}
