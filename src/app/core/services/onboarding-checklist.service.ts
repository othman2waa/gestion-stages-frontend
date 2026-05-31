import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChecklistItemResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OnboardingChecklistService {
  private api = `${environment.apiUrl}/onboarding`;
  constructor(private http: HttpClient) {}

  getChecklist(stagiaireId: number): Observable<ChecklistItemResponse[]> {
    return this.http.get<ChecklistItemResponse[]>(`${this.api}/stagiaire/${stagiaireId}`);
  }

  getMonChecklist(): Observable<ChecklistItemResponse[]> {
    return this.http.get<ChecklistItemResponse[]>(`${this.api}/mon-checklist`);
  }

  completer(id: number): Observable<ChecklistItemResponse> {
    return this.http.patch<ChecklistItemResponse>(`${this.api}/${id}/complete`, {});
  }

  getStats(stagiaireId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/stats/${stagiaireId}`);
  }
}
