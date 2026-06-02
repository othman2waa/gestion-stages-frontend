import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StagiaireResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class StagiaireService {
  private api = `${environment.apiUrl}/stagiaires`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StagiaireResponse[]> {
    return this.http.get<StagiaireResponse[]>(this.api);
  }

  getById(id: number): Observable<StagiaireResponse> {
    return this.http.get<StagiaireResponse>(`${this.api}/${id}`);
  }

  create(data: any): Observable<StagiaireResponse> {
    return this.http.post<StagiaireResponse>(this.api, data);
  }

  update(id: number, data: any): Observable<StagiaireResponse> {
    return this.http.put<StagiaireResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  search(keyword: string): Observable<StagiaireResponse[]> {
    return this.http.get<StagiaireResponse[]>(`${this.api}/search?keyword=${keyword}`);
  }

  getMesStagiaires(): Observable<StagiaireResponse[]> {
    return this.http.get<StagiaireResponse[]>(`${this.api}/mes-stagiaires`);
  }

  rechercher(params: any): Observable<any> {
    return this.http.get<any>(`${this.api}/rechercher`, { params });
  }
}
