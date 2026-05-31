import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StagiaireDashboardResponse {
  stageId: number;
  stageSujet: string;
  stagiaireNom: string;
  encadrantNom: string;
  departementNom: string;
  typeStage: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  progression: number;
  evaluations: any[];
  suivis: any[];
  checklist: any[];
  rapport: any;
}

@Injectable({ providedIn: 'root' })
export class StagiaireDashboardService {
  private api = `${environment.apiUrl}/stagiaires`;
  constructor(private http: HttpClient) {}

  getMonDashboard(): Observable<StagiaireDashboardResponse> {
    return this.http.get<StagiaireDashboardResponse>(`${this.api}/mon-dashboard`);
  }
}
