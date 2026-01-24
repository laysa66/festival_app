import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { reservationRoleGuard } from './core/guards/reservation-role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent} from './features/auth/register/register.component';
import {  DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersManagementComponent} from './features/users-management/users-management.component';
import { EditeursComponent} from './features/editeurs/editeurs.component';
import { PublicViewDashboardComponent } from './features/public-view/public-view-dash/public-view-dashboard.component';
import { PublicViewGamesComponent } from './features/public-view/public-view-games/public-view-games.component';
import { PublicViewZonesComponent } from './features/public-view/public-view-zones/public-view-zones.component';
import { UserRole } from './core/models/user.interface';
import { FestivalListComponent } from './features/festival/festival-list/festival-list.component';
import { ReservationsListComponent } from './features/reservations/reservations-list/reservations-list.component';
import { ReservationFormComponent } from './features/reservations/reservation-form/reservation-form.component';
import { GamesManagementComponent } from './features/festival/games-management/games-management.component';

// on met [authGuard] pour protéger les routes nécessitant une authentification
// on met roleGuard avec les rôles autorisés pour les routes restreintes par rôle

export const routes: Routes = [
  {
    path: '',
    component: PublicViewDashboardComponent
  },
  {
    path: 'public',
    children: [
      {
        path: 'games',
        component: PublicViewGamesComponent
      },
      {
        path: 'zones-tarifaires',
        component: PublicViewZonesComponent
      },
      {
        path: 'zones-plan',
        component: PublicViewZonesComponent
      }
    ]
  },
  {
    path: 'login', component: LoginComponent 
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  {
    path: 'users',
    component: UsersManagementComponent,
    canActivate: [
      authGuard,
      roleGuard([UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN])
    ]
  },
  {
    path: 'editeurs',
    component: EditeursComponent,
    canActivate: [
      authGuard,
      roleGuard([UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN, UserRole.ORGANISATEUR])
    ]
  },
  {
    path: 'festivals',
    component: FestivalListComponent,
    canActivate: [
      authGuard,
      roleGuard([UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN, UserRole.ORGANISATEUR])
    ]
  },
  {
    path: 'reservations',
    canActivate: [authGuard, reservationRoleGuard],
    children: [
      {
        path: '',
        component: ReservationsListComponent
      },
      {
        path: 'new',
        component: ReservationFormComponent
      },
      {
        path: ':id',
        component: ReservationFormComponent
      },
      {
        path: ':id/edit',
        component: ReservationFormComponent
      }
    ]
  },
  {
    path: 'games',
    component: GamesManagementComponent,
    canActivate: [
      authGuard,
      roleGuard([UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN, UserRole.ORGANISATEUR])
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
