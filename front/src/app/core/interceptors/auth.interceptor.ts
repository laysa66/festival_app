import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clone la requête pour inclure les credentials (cookies)
  // withCredentials: true permet d'envoyer automatiquement les cookies au serveur
  req = req.clone({
    withCredentials: true
  });

  return next(req).pipe(
    catchError((error) => {
      // Si erreur 401, déconnecter l'utilisateur
      // MAIS PAS sur les routes d'authentification (login/register)
      if (error.status === 401) {
        const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
        if (!isAuthRoute) {
          //console.log('❌ 401 Unauthorized - Logging out');
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
