import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth service to finish initializing before checking auth
  return authService.isInitialized$.pipe(
    filter(initialized => initialized === true),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      // Rediriger vers login avec l'URL de retour
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    })
  );
};
