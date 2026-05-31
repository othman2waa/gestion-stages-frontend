import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConventionResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ConventionService {
  private api = `${environment.apiUrl}/conventions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConventionResponse[]> {
    return this.http.get<ConventionResponse[]>(this.api);
  }

  getById(id: number): Observable<ConventionResponse> {
    return this.http.get<ConventionResponse>(`${this.api}/${id}`);
  }

  create(data: any): Observable<ConventionResponse> {
    return this.http.post<ConventionResponse>(this.api, data);
  }

  update(id: number, data: any): Observable<ConventionResponse> {
    return this.http.put<ConventionResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/pdf`, { responseType: 'blob' });
  }
}
