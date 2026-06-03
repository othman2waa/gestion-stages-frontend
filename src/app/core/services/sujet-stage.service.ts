import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SujetStageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class SujetStageService {
  private api = `${environment.apiUrl}/sujets`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<SujetStageResponse[]> { return this.http.get<SujetStageResponse[]>(this.api); }
  getMesSujets(): Observable<SujetStageResponse[]> { return this.http.get<SujetStageResponse[]>(`${this.api}/mes-sujets`); }
  getByStatut(statut: string): Observable<SujetStageResponse[]> { return this.http.get<SujetStageResponse[]>(`${this.api}/statut/${statut}`); }
  proposer(data: any): Observable<SujetStageResponse> { return this.http.post<SujetStageResponse>(this.api, data); }
  modifier(id: number, data: any): Observable<SujetStageResponse> { return this.http.put<SujetStageResponse>(`${this.api}/${id}`, data); }
  valider(id: number): Observable<SujetStageResponse> { return this.http.patch<SujetStageResponse>(`${this.api}/${id}/valider`, {}); }
  refuser(id: number): Observable<SujetStageResponse> { return this.http.patch<SujetStageResponse>(`${this.api}/${id}/refuser`, {}); }
  affecter(id: number, data: any): Observable<SujetStageResponse> { return this.http.patch<SujetStageResponse>(`${this.api}/${id}/affecter`, data); }
  supprimer(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
