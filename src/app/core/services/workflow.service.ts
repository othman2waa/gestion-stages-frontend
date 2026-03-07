import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WorkflowRequest {
  nouveauStatut: string;
  commentaire?: string;
}

export interface StageHistorique {
  id: number;
  statutPrecedent: string;
  statutNouveau: string;
  commentaire: string;
  modifiePar: string;
  dateModification: string;
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private apiUrl = 'http://localhost:8080/api/workflow/stages';

  constructor(private http: HttpClient) {}

  transitionner(stageId: number, request: WorkflowRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${stageId}/transition`, request);
  }

  getHistorique(stageId: number): Observable<StageHistorique[]> {
    return this.http.get<StageHistorique[]>(`${this.apiUrl}/${stageId}/historique`);
  }

  getTransitionsPossibles(stageId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${stageId}/transitions-possibles`);
  }
}