import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StagiaireDashboardService {
  private api = `${environment.apiUrl}/stagiaires`;
  constructor(private http: HttpClient) {}
  getMonDashboard(): Observable<any> {
    return this.http.get<any>(`${this.api}/mon-dashboard`);
  }
}