import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.interface';
import { AuthResponse, RegisterRequest, LoginRequest } from '../models/auth-response.interface';

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly USER_KEY = 'current_user';


  // on va suivre l'utilisateur connecté 
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      catchError(this.handleError)
    );
  }


  // fonction de login
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data, { 
      withCredentials: true // pour envoyer les cookieset les recevoir
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          // Le token est automatiquement stocké dans un cookie HttpOnly par le backend
          // On stocke juste l'utilisateur en localStorage
          this.setUser(response.user);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    // Appeler l'API pour supprimer le cookie côté serveur
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => {
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      },
      error: () => {
        // Même en cas d'erreur, on nettoie localement
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  }
  // // fonction pour 
  // getMe(): Observable<{ success: boolean; user: User }> {
  //   return this.http.get<{ success: boolean; user: User }>(`${this.API_URL}/me`).pipe(
  //     tap(response => {
  //       if (response.success && response.user) {
  //         this.setUser(response.user);
  //         this.currentUserSubject.next(response.user);
  //       }
  //     }),
  //     catchError(this.handleError)
  //   );
  // }

  isAuthenticated(): boolean {
    // On vérifie si l'utilisateur est en mémoire (le cookie est géré automatiquement)
    return !!this.getCurrentUser();
  }

  // recupere l'utilisateur actuel 
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  //mettre 
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
