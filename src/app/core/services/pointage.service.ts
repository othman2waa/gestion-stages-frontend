import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PointageBulkRequest, PointageResponse } from '../models/pointage.model';

@Injectable({ providedIn: 'root' })
export class PointageService {
  private api = `${environment.apiUrl}/pointages`;
  constructor(private http: HttpClient) {}

  saveBulk(request: PointageBulkRequest): Observable<PointageResponse[]> {
    return this.http.post<PointageResponse[]>(`${this.api}/bulk`, request);
  }

  getByStage(stageId: number): Observable<PointageResponse[]> {
    return this.http.get<PointageResponse[]>(`${this.api}/stage/${stageId}`);
  }
}
