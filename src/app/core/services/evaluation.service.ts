import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EvaluationResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private api = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(this.api);
  }

  getById(id: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.api}/${id}`);
  }

  create(data: any): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(this.api, data);
  }

  update(id: number, data: any): Observable<EvaluationResponse> {
    return this.http.put<EvaluationResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getMesEvaluations(): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.api}/mes-evaluations`);
  }

  getMesEvaluationsEncadrant(): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.api}/encadrant/mes-evaluations`);
  }
}
