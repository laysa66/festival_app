import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Editeur {
  id: number;
  libelle: string;
  exposant: boolean;
  distributeur: boolean;
  logo?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EditeursService {
  private http = inject(HttpClient);
  //private apiUrl = 'http://localhost:3000/api';
  private apiUrl = `${environment.apiBaseUrl}/api`;

  getEditeurs(): Observable<Editeur[]> {
    return this.http.get<{ success: boolean; editeurs: Editeur[]; total: number }>(`${this.apiUrl}/editeurs`)
      .pipe(
        map(response => response.editeurs || [])
      );
  }

  getEditeurById(id: number): Observable<Editeur> {
    return this.http.get<{ success: boolean; editeur: Editeur }>(`${this.apiUrl}/editeurs/${id}`)
      .pipe(
        map(response => response.editeur)
      );
  }

  updateEditeur(id: number, data: Partial<Editeur>): Observable<Editeur> {
    return this.http.put<{ success: boolean; message: string; editeur: Editeur }>(`${this.apiUrl}/editeurs/${id}`, data)
      .pipe(
        map(response => response.editeur)
      );
  }

  deleteEditeur(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/editeurs/${id}`);
  }

  createEditeur(data: Partial<Editeur>): Observable<Editeur> {
    return this.http.post<{ success: boolean; message: string; editeur: Editeur }>(`${this.apiUrl}/editeurs`, data)
      .pipe(
        map(response => response.editeur)
      );
  }
}
