import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private api = 'http://localhost:8080/api/onboarding';

  constructor(private http: HttpClient) {}

  analyserCV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/analyser-cv`, formData);
  }

  creerCompte(infos: any): Observable<any> {
    return this.http.post(`${this.api}/creer-compte`, infos);
  }
}