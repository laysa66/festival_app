import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent} from './features/auth/register/register.component';
import {  DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersManagementComponent} from './features/users-management/users-management.component';
import { ClientsComponent} from './features/clients/clients.component';
import { UserRole } from './core/models/user.interface';

// on met [authGuard] pour protéger les routes nécessitant une authentification
// on met roleGuard avec les rôles autorisés pour les routes restreintes par rôle

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
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
    path: 'clients',
    component: ClientsComponent,
    canActivate: [
      authGuard,
      roleGuard([UserRole.SUPER_ORGANISATEUR, UserRole.ADMIN])
    ]
  },
  {
    path: 'festivals',
    loadComponent: () => import('./features/festival/festival-card/festival-card.component').then(m=>m.FestivalCardComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
