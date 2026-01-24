import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Jeu {
  id: number;
  libelle: string;
  auteur: string | null;
  nbMinJoueur: number | null;
  nbMaxJoueur: number | null;
  ageMin: number | null;
  duree: number | null;
  prototype: boolean;
  editeur: { id: number; libelle: string } | null;
  typeJeu: { id: number; libelle: string } | null;
}

export interface JeuCreateRequest {
  libelle: string;
  auteur?: string;
  nbMinJoueur?: number;
  nbMaxJoueur?: number;
  ageMin?: number;
  duree?: number;
  prototype?: boolean;
  idEditeur?: number;
  idTypeJeu?: number;
  theme?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JeuService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}`;

  /**
   * Search games by name or author
   */
  searchGames(search?: string, limit = 50, offset = 0): Observable<Jeu[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Jeu[] | { success: boolean; jeux: Jeu[]; total: number }>(`${this.apiUrl}/jeux`, { params })
      .pipe(
        map(response => {
          if (Array.isArray(response)) {
            return response;
          }
          return response.jeux || [];
        })
      );
  }

  /**
   * Get a game by ID
   */
  getGameById(id: number): Observable<Jeu> {
    return this.http.get<{ success: boolean; jeu: Jeu }>(`${this.apiUrl}/jeux/${id}`)
      .pipe(
        map(response => response.jeu)
      );
  }

  /**
   * Create a new game
   */
  createGame(data: JeuCreateRequest): Observable<Jeu> {
    return this.http.post<{ success: boolean; message: string; jeu: Jeu }>(`${this.apiUrl}/jeux`, data)
      .pipe(
        map(response => response.jeu)
      );
  }
}
