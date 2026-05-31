import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SuiviResponse, SuiviRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class SuiviService {
  private api = `${environment.apiUrl}/suivis`;
  constructor(private http: HttpClient) {}

  create(data: SuiviRequest): Observable<SuiviResponse> {
    return this.http.post<SuiviResponse>(this.api, data);
  }

  update(id: number, data: SuiviRequest): Observable<SuiviResponse> {
    return this.http.put<SuiviResponse>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getByStage(stageId: number): Observable<SuiviResponse[]> {
    return this.http.get<SuiviResponse[]>(`${this.api}/stage/${stageId}`);
  }

  getMesSuivis(): Observable<SuiviResponse[]> {
    return this.http.get<SuiviResponse[]>(`${this.api}/mes-suivis`);
  }
}
