import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StageHistoriqueResponse, StageResponse, StageStatus } from '../models';

export type StageHistorique = StageHistoriqueResponse;

export interface WorkflowRequest {
  nouveauStatut: string;
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private apiUrl = `${environment.apiUrl}/workflow/stages`;

  constructor(private http: HttpClient) {}

  transitionner(stageId: number, request: WorkflowRequest): Observable<StageResponse> {
    return this.http.post<StageResponse>(`${this.apiUrl}/${stageId}/transition`, request);
  }

  getHistorique(stageId: number): Observable<StageHistoriqueResponse[]> {
    return this.http.get<StageHistoriqueResponse[]>(`${this.apiUrl}/${stageId}/historique`);
  }

  getTransitionsPossibles(stageId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${stageId}/transitions-possibles`);
  }
}
