import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OnboardingChecklistService {
  private api = `${environment.apiUrl}/onboarding`;
  constructor(private http: HttpClient) {}

  getChecklist(stagiaireId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/stagiaire/${stagiaireId}`);
  }

  getMonChecklist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/mon-checklist`);
  }

  completer(id: number): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}/complete`, {});
  }

  getStats(stagiaireId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/stats/${stagiaireId}`);
  }
}
