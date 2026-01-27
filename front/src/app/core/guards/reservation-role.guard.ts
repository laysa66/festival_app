import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.interface';

/**
 * Guard pour vérifier que l'utilisateur a un rôle autorisé pour accéder aux réservations
 * Rôles autorisés: ORGANISATEUR, SUPER_ORGANISATEUR, ADMIN
 */
export const reservationRoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  
  //console.log('🔒 ReservationRoleGuard - Current user:', currentUser);
  //console.log('🔒 ReservationRoleGuard - User role:', currentUser?.role);

  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    //console.log('❌ ReservationRoleGuard - No user, redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Vérifier si l'utilisateur a un rôle autorisé
  const allowedRoles: UserRole[] = [
    UserRole.ORGANISATEUR,
    UserRole.SUPER_ORGANISATEUR,
    UserRole.ADMIN
  ];

  if (allowedRoles.includes(currentUser.role)) {
    //console.log('✅ ReservationRoleGuard - Access granted');
    return true;
  }

  // Rediriger vers le dashboard si l'utilisateur n'a pas les permissions
  //console.log('❌ ReservationRoleGuard - Insufficient permissions, redirecting to dashboard');
  router.navigate(['/dashboard']);
  return false;
};

/**
 * Guard pour vérifier que l'utilisateur est au moins SUPER_ORGANISATEUR
 * Requis pour les actions critiques comme la suppression de réservations
 */
export const superOrganizerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Vérifier si l'utilisateur est SUPER_ORGANISATEUR ou ADMIN
  const allowedRoles: UserRole[] = [
    UserRole.SUPER_ORGANISATEUR,
    UserRole.ADMIN
  ];

  if (allowedRoles.includes(currentUser.role)) {
    return true;
  }

  // Rediriger vers le dashboard si l'utilisateur n'a pas les permissions
  router.navigate(['/dashboard']);
  return false;
};
