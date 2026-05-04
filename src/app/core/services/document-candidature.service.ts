import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentCandidatureService {
  private api = 'http://localhost:8080/api/candidatures';
  constructor(private http: HttpClient) {}

  getDocuments(candidatureId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${candidatureId}/documents`);
  }

  uploadDocument(candidatureId: number, type: string, fichier: File): Observable<any> {
    const form = new FormData();
    form.append('type', type);
    form.append('fichier', fichier);
    return this.http.post(`${this.api}/${candidatureId}/upload-document`, form);
  }

  verifierIa(candidatureId: number): Observable<any> {
    return this.http.post(`${this.api}/${candidatureId}/verifier-ia`, {});
  }

  validerFinal(candidatureId: number, decision: string, commentaire: string): Observable<any> {
    return this.http.patch(`${this.api}/${candidatureId}/valider-final`, { decision, commentaire });
  }
}