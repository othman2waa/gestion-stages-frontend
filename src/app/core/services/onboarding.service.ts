import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StagiaireResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private api = `${environment.apiUrl}/onboarding`;

  constructor(private http: HttpClient) {}

  analyserCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/analyser-cv`, formData);
  }

  creerCompte(infos: any): Observable<StagiaireResponse> {
    return this.http.post<StagiaireResponse>(`${this.api}/creer-compte`, infos);
  }
}
