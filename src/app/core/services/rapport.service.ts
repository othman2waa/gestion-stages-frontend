import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RapportResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class RapportService {
  private api = `${environment.apiUrl}/rapports`;
  constructor(private http: HttpClient) {}

  upload(stageId: number, file: File): Observable<RapportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<RapportResponse>(`${this.api}/stage/${stageId}`, formData);
  }

  getMeta(stageId: number): Observable<RapportResponse> {
    return this.http.get<RapportResponse>(`${this.api}/stage/${stageId}`);
  }

  download(stageId: number): Observable<Blob> {
    return this.http.get(`${this.api}/stage/${stageId}/download`, { responseType: 'blob' });
  }

  delete(stageId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/stage/${stageId}`);
  }

  getMesRapports(): Observable<RapportResponse[]> {
    return this.http.get<RapportResponse[]>(`${this.api}/mes-rapports`);
  }

  valider(stageId: number, decision: 'VALIDE' | 'REFUSE', commentaire: string): Observable<RapportResponse> {
    return this.http.patch<RapportResponse>(`${this.api}/stage/${stageId}/validation`, { decision, commentaire });
  }

  resume(stageId: number): Observable<{ resume: string }> {
    return this.http.get<{ resume: string }>(`${this.api}/stage/${stageId}/resume`);
  }
}
