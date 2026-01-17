import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.interface';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const user = authService.getCurrentUser();
    
    if (!user) {
      router.navigate(['/login']);
      return false;
    }
    
    if (allowedRoles.includes(user.role)) {
      return true;
    }
    
    // Si l'utilisateur n'a pas le bon rôle, le rediriger vers le dashboard
    router.navigate(['/dashboard']);
    return false;
  };
};
