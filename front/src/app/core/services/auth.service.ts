import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.interface';
import { AuthResponse, RegisterRequest, LoginRequest } from '../models/auth-response.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = `${environment.apiBaseUrl}/auth`;

  // Utilisateur connecté (stocké uniquement en mémoire)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Track if initial session check is complete
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();

  constructor() {
    // Au démarrage, vérifier la session via le cookie HttpOnly
    this.initializeSession();
  }

  /**
   * Initialise la session en vérifiant le cookie avec l'API
   * Aucune donnée n'est stockée en localStorage - tout passe par le cookie sécurisé
   */
  private initializeSession(): void {
    //console.log('🔐 Vérification de la session via cookie...');
    
    this.http.get<{ success: boolean; user: User }>(`${this.API_URL}/me`, {
      withCredentials: true
    }).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          //console.log('✅ Session valide:', response.user.email);
          this.currentUserSubject.next(response.user);
        } else {
          //console.log('❌ Pas de session active');
          this.currentUserSubject.next(null);
        }
        this.isInitializedSubject.next(true);
      },
      error: (err) => {
        //console.log('❌ Pas de session ou erreur:', err.status);
        this.currentUserSubject.next(null);
        this.isInitializedSubject.next(true);
      }
    });
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Connexion - Le token est stocké dans un cookie HttpOnly par le backend
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data, { 
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          // Le token est automatiquement stocké dans un cookie HttpOnly par le backend
          // On stocke l'utilisateur uniquement en mémoire
          //console.log('✅ Login réussi:', response.user.email);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Déconnexion - Supprime le cookie côté serveur
   */
  logout(): void {
    //console.log('🚪 Logout - Suppression du cookie...');
    
    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      },
      error: () => {
        // Même en cas d'erreur, on nettoie en mémoire
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Force une nouvelle vérification de session (utile après un 401)
   */
  refreshSession(): void {
    this.initializeSession();
  }

  /**
   * Vérifie si l'utilisateur est authentifié (en mémoire)
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Récupère l'utilisateur actuel depuis la mémoire
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Gestion des erreurs HTTP
   */
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
