import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Festival } from '../models/festival';

export interface ZoneTarifaire {
  id: number;
  nom: string;
  prixTable: number;
  prixM2: number;
  festivalId: number;
}

export interface ZonePlan {
  id: number;
  nom: string;
  zoneTarifaireId: number;
  festivalId: number;
}

@Injectable({
  providedIn: 'root',
})
export class FestivalService {
  private apiUrl = 'http://localhost:3000/api/festivals';
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAllFestivals(): Observable<Festival[]> {
    return this.http.get<Festival[]>(this.apiUrl);
  }

  getFestivalById(id: number): Observable<Festival> {
    return this.http.get<Festival>(`${this.apiUrl}/${id}`);
  }

  createFestival(festival: any): Observable<Festival> {
    return this.http.post<Festival>(this.apiUrl, festival);
  }

  updateFestival(id: number, festival: any): Observable<Festival> {
    return this.http.put<Festival>(`${this.apiUrl}/${id}`, festival);
  }

  deleteFestival(id: number): Observable<Festival> {
    return this.http.delete<Festival>(`${this.apiUrl}/${id}`);
  }

  // Zone Tarifaire Methods
  addZoneTarifaire(festivalId: number, zone: any): Observable<ZoneTarifaire> {
    return this.http.post<ZoneTarifaire>(
      `${this.apiUrl}/${festivalId}/zones-tarifaires`,
      zone
    );
  }

  updateZoneTarifaire(zoneId: number, zone: any): Observable<ZoneTarifaire> {
    return this.http.put<ZoneTarifaire>(
      `${this.baseUrl}/zones-tarifaires/${zoneId}`,
      zone
    );
  }

  deleteZoneTarifaire(zoneId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/zones-tarifaires/${zoneId}`
    );
  }

  // Zone Plan Methods
  addZonePlan(festivalId: number, zonePlan: any): Observable<ZonePlan> {
    return this.http.post<ZonePlan>(
      `${this.apiUrl}/${festivalId}/zone-plans`,
      zonePlan
    );
  }

  updateZonePlan(zonePlanId: number, zonePlan: any): Observable<ZonePlan> {
    return this.http.put<ZonePlan>(
      `${this.baseUrl}/zone-plans/${zonePlanId}`,
      zonePlan
    );
  }

  deleteZonePlan(zonePlanId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/zone-plans/${zonePlanId}`
    );
  }

  // Get all games
  getAllGames(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jeux`);
  }

  // Get filtered games
  getFilteredGames(filters: {
    typeJeu?: number;
    minDuration?: number;
    maxDuration?: number;
    minPlayers?: number;
    maxPlayers?: number;
  }): Observable<any[]> {
    let params = new URLSearchParams();
    if (filters.typeJeu) params.append('typeJeu', filters.typeJeu.toString());
    if (filters.minDuration !== undefined) params.append('minDuration', filters.minDuration.toString());
    if (filters.maxDuration !== undefined) params.append('maxDuration', filters.maxDuration.toString());
    if (filters.minPlayers !== undefined) params.append('minPlayers', filters.minPlayers.toString());
    if (filters.maxPlayers !== undefined) params.append('maxPlayers', filters.maxPlayers.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/jeux/filter?${queryString}` : `${this.baseUrl}/jeux/filter`;
    return this.http.get<any[]>(url);
  }

  // Create game
  createGame(gameData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/jeux`, gameData);
  }

  // Update game
  updateGame(id: number, gameData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/jeux/${id}`, gameData);
  }

  // Delete game
  deleteGame(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/jeux/${id}`);
  }

  // Get games by zone tarifaire
  getGamesByZoneTarifaire(zoneTarifaireId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jeux/zone-tarifaire/${zoneTarifaireId}`);
  }

  // Get games by zone plan
  getGamesByZonePlan(zonePlanId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jeux/zone-plan/${zonePlanId}`);
  }
}

