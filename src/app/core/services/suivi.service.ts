import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuiviService {
  private api = `${environment.apiUrl}/suivis`;
  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post<any>(this.api, data);
  }
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
  getByStage(stageId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/stage/${stageId}`);
  }
  getMesSuivis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/mes-suivis`);
  }
}