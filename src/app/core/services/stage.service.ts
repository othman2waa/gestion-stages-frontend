import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StageResponse, StageRequest, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class StageService {
  private api = `${environment.apiUrl}/stages`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StageResponse[]> {
    return this.http.get<StageResponse[]>(this.api);
  }

  getById(id: number): Observable<StageResponse> {
    return this.http.get<StageResponse>(`${this.api}/${id}`);
  }

  create(data: StageRequest): Observable<StageResponse> {
    return this.http.post<StageResponse>(this.api, data);
  }

  update(id: number, data: StageRequest): Observable<StageResponse> {
    return this.http.put<StageResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  updateStatut(id: number, statut: string): Observable<StageResponse> {
    return this.http.patch<StageResponse>(`${this.api}/${id}/statut?statut=${statut}`, {});
  }

  getMesStages(): Observable<StageResponse[]> {
    return this.http.get<StageResponse[]>(`${this.api}/mes-stages`);
  }

  rechercher(params: any): Observable<PageResponse<StageResponse>> {
    return this.http.get<PageResponse<StageResponse>>(`${this.api}/rechercher`, { params });
  }

  getByEncadrant(encadrantId: number): Observable<StageResponse[]> {
    return this.http.get<StageResponse[]>(`${this.api}/encadrant/${encadrantId}`);
  }
}
