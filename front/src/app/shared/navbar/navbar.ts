import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.interface';

interface NavLink {
  path: string;
  label: string;
  icon?: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;
  visibleLinks: NavLink[] = [];

  private allLinks: NavLink[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      roles: [
        UserRole.USER,
        UserRole.BENEVOLE,
        UserRole.ORGANISATEUR,
        UserRole.SUPER_ORGANISATEUR,
        UserRole.ADMIN
      ]
    },
    {
      path: '/clients',
      label: 'Clients',
      roles: [UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN]
    },
    {
      path: '/users',
      label: 'Gestion Utilisateurs',
      roles: [UserRole.ADMIN]
    }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateVisibleLinks();
    });
  }

  private updateVisibleLinks(): void {
    if (!this.currentUser) {
      this.visibleLinks = [];
      return;
    }

    this.visibleLinks = this.allLinks.filter(link =>
      link.roles.includes(this.currentUser!.role)
    );
  }

  logout(): void {
    this.authService.logout();
  }

  get userRoleLabel(): string {
    return this.currentUser?.role || '';
  }
}
