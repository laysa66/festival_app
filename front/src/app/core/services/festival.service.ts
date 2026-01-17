import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Festival } from '../models/festival';

@Injectable({
  providedIn: 'root',
})
export class FestivalService {
  private apiUrl = 'http://localhost:3000/api/festivals';

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
}
