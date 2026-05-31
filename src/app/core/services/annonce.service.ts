import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnnonceResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AnnonceService {
  private api = `${environment.apiUrl}/annonces`;
  constructor(private http: HttpClient) {}

  getPubliques(): Observable<AnnonceResponse[]> {
    return this.http.get<AnnonceResponse[]>(`${this.api}/publiques`);
  }

  getAll(): Observable<AnnonceResponse[]> {
    return this.http.get<AnnonceResponse[]>(this.api);
  }

  getById(id: number): Observable<AnnonceResponse> {
    return this.http.get<AnnonceResponse>(`${this.api}/${id}`);
  }

  create(data: any): Observable<AnnonceResponse> {
    return this.http.post<AnnonceResponse>(this.api, data);
  }

  update(id: number, data: any): Observable<AnnonceResponse> {
    return this.http.put<AnnonceResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  toggle(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/toggle`, {});
  }
}
