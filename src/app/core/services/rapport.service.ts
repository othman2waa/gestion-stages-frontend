import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RapportService {
  private api = 'http://localhost:8080/api/rapports';
  constructor(private http: HttpClient) {}

  upload(stageId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.api}/stage/${stageId}`, formData);
  }

  getMeta(stageId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/stage/${stageId}`);
  }

  download(stageId: number): Observable<Blob> {
    return this.http.get(`${this.api}/stage/${stageId}/download`, { responseType: 'blob' });
  }

  delete(stageId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/stage/${stageId}`);
  }

  getMesRapports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/mes-rapports`);
  }
}