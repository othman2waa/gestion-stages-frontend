import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StagiaireDashboardService {
  private api = 'http://localhost:8080/api/stagiaires';
  constructor(private http: HttpClient) {}
  getMonDashboard(): Observable<any> {
    return this.http.get<any>(`${this.api}/mon-dashboard`);
  }
}