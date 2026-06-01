import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FicheStageRequest, FicheStageResponse,
  FicheStagiaireRequest, FicheStagiaireResponse
} from '../models/fiche-appreciation.model';

@Injectable({ providedIn: 'root' })
export class FicheAppreciationService {
  private api = `${environment.apiUrl}/fiches-appreciation`;

  constructor(private http: HttpClient) {}

  // Fiche Stage
  createFicheStage(data: FicheStageRequest): Observable<FicheStageResponse> {
    return this.http.post<FicheStageResponse>(`${this.api}/stage`, data);
  }

  updateFicheStage(id: number, data: FicheStageRequest): Observable<FicheStageResponse> {
    return this.http.put<FicheStageResponse>(`${this.api}/stage/${id}`, data);
  }

  getFicheStageByStageId(stageId: number): Observable<FicheStageResponse> {
    return this.http.get<FicheStageResponse>(`${this.api}/stage/by-stage/${stageId}`);
  }

  getAllFichesStage(): Observable<FicheStageResponse[]> {
    return this.http.get<FicheStageResponse[]>(`${this.api}/stage`);
  }

  getMesFichesStage(): Observable<FicheStageResponse[]> {
    return this.http.get<FicheStageResponse[]>(`${this.api}/encadrant/mes-fiches-stage`);
  }

  // Fiche Stagiaire
  createFicheStagiaire(data: FicheStagiaireRequest): Observable<FicheStagiaireResponse> {
    return this.http.post<FicheStagiaireResponse>(`${this.api}/stagiaire`, data);
  }

  updateFicheStagiaire(id: number, data: FicheStagiaireRequest): Observable<FicheStagiaireResponse> {
    return this.http.put<FicheStagiaireResponse>(`${this.api}/stagiaire/${id}`, data);
  }

  getFicheStagiaireByStageId(stageId: number): Observable<FicheStagiaireResponse> {
    return this.http.get<FicheStagiaireResponse>(`${this.api}/stagiaire/by-stage/${stageId}`);
  }

  getAllFichesStagiaire(): Observable<FicheStagiaireResponse[]> {
    return this.http.get<FicheStagiaireResponse[]>(`${this.api}/stagiaire`);
  }

  getMesFichesStagiaire(): Observable<FicheStagiaireResponse[]> {
    return this.http.get<FicheStagiaireResponse[]>(`${this.api}/encadrant/mes-fiches-stagiaire`);
  }
}
