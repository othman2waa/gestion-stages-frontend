import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidatureResponse, TraiterCandidatureRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private api = `${environment.apiUrl}/candidatures`;
  constructor(private http: HttpClient) {}

  soumettre(data: any, cv?: File): Observable<CandidatureResponse> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (cv) formData.append('cv', cv);
    return this.http.post<CandidatureResponse>(this.api, formData);
  }

  getAll(): Observable<CandidatureResponse[]> {
    return this.http.get<CandidatureResponse[]>(this.api);
  }

  getByStatut(statut: string): Observable<CandidatureResponse[]> {
    return this.http.get<CandidatureResponse[]>(`${this.api}/statut/${statut}`);
  }

  getById(id: number): Observable<CandidatureResponse> {
    return this.http.get<CandidatureResponse>(`${this.api}/${id}`);
  }

  traiter(id: number, data: TraiterCandidatureRequest): Observable<CandidatureResponse> {
    return this.http.patch<CandidatureResponse>(`${this.api}/${id}/traiter`, data);
  }

  getCv(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/cv`, { responseType: 'blob' });
  }
}
