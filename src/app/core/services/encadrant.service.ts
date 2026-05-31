import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EncadrantResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class EncadrantService {
  private api = `${environment.apiUrl}/encadrants`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EncadrantResponse[]> {
    return this.http.get<EncadrantResponse[]>(this.api);
  }

  getById(id: number): Observable<EncadrantResponse> {
    return this.http.get<EncadrantResponse>(`${this.api}/${id}`);
  }

  create(data: any): Observable<EncadrantResponse> {
    return this.http.post<EncadrantResponse>(this.api, data);
  }

  update(id: number, data: any): Observable<EncadrantResponse> {
    return this.http.put<EncadrantResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getMonProfil(): Observable<EncadrantResponse> {
    return this.http.get<EncadrantResponse>(`${this.api}/mon-profil`);
  }
}
