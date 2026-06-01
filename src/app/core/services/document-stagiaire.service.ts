import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentStagiaireResponse } from '../models/document-stagiaire.model';

@Injectable({ providedIn: 'root' })
export class DocumentStagiaireService {

  private baseUrl = `${environment.apiUrl}/documents-stagiaire`;

  constructor(private http: HttpClient) {}

  upload(typeDocument: string, file: File): Observable<DocumentStagiaireResponse> {
    const formData = new FormData();
    formData.append('type', typeDocument);
    formData.append('file', file);
    return this.http.post<DocumentStagiaireResponse>(`${this.baseUrl}/upload`, formData);
  }

  getMesDocuments(): Observable<DocumentStagiaireResponse[]> {
    return this.http.get<DocumentStagiaireResponse[]>(`${this.baseUrl}/mes-documents`);
  }

  getDocumentsByStagiaire(stagiaireId: number): Observable<DocumentStagiaireResponse[]> {
    return this.http.get<DocumentStagiaireResponse[]>(`${this.baseUrl}/stagiaire/${stagiaireId}`);
  }

  download(documentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${documentId}/download`, { responseType: 'blob' });
  }

  delete(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${documentId}`);
  }
}
