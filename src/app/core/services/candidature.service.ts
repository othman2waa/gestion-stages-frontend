import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private api = 'http://localhost:8080/api/candidatures';
  constructor(private http: HttpClient) {}

  soumettre(data: any, cv?: File): Observable<any> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (cv) formData.append('cv', cv);
    return this.http.post<any>(this.api, formData);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  getByStatut(statut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/statut/${statut}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  traiter(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}/traiter`, data);
  }

  getCv(id: number): Observable<Blob> {
  return this.http.get(`${this.api}/${id}/cv`, { responseType: 'blob' });
}
}