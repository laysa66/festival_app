import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Festival } from '../models/festival';
import { environment } from '../../../environments/environment';


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
  //private apiUrl = 'http://localhost:3000/api/festivals';
  private apiUrl = `${environment.apiBaseUrl}/api/festivals`;
  //private baseUrl = 'http://localhost:3000/api';
  private baseUrl = `${environment.apiBaseUrl}/api`;

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
}

