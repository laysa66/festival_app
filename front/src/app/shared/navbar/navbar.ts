import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.interface';

interface NavLink {
  path: string;
  label: string;
  icon?: string;
  roles: UserRole[];
}

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;
  visibleLinks: NavLink[] = [];
  isHomePage = false;

  private allLinks: NavLink[] = [
    {
      path: '/dashboard',
      label: 'Tableau de bord',
      icon: 'pi pi-chart-bar',
      roles: [
        UserRole.USER,
        UserRole.BENEVOLE,
        UserRole.ORGANISATEUR,
        UserRole.SUPER_ORGANISATEUR,
        UserRole.ADMIN
      ]
    },
    {
      path: '/editeurs',
      label: 'Éditeurs',
      icon: 'pi pi-book',
      roles: [UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN, UserRole.ORGANISATEUR]
    },
    {
      path: '/games',
      label: 'Jeux',
      icon: 'pi pi-objects-column',
      roles: [UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN, UserRole.ORGANISATEUR]
    },
    {
      path: '/festivals',
      label: 'Festivals',
      icon: 'pi pi-calendar',
      roles: [
        UserRole.SUPER_ORGANISATEUR,
        UserRole.ADMIN,
        UserRole.ORGANISATEUR
      ]
    },
    {
      path: '/reservations',
      label: 'Réservations',
      icon: 'pi pi-file-edit',
      roles: [
        UserRole.ORGANISATEUR,
        UserRole.SUPER_ORGANISATEUR,
        UserRole.ADMIN
      ]
    },
    {
      path: '/users',
      label: 'Gestion Utilisateurs',
      icon: 'pi pi-users',
      roles: [UserRole.ADMIN]
    }
  ];

  ngOnInit(): void {
    // Check initial route
    this.checkIfHomePage(this.router.url);

    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkIfHomePage(event.urlAfterRedirects || event.url);
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateVisibleLinks();
    });
  }

  private checkIfHomePage(url: string): void {
    this.isHomePage = url === '/' || url === '/home';
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
