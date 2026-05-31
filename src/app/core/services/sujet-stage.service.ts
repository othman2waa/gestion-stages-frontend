import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SujetStageService {
  private api = `${environment.apiUrl}/sujets`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> { return this.http.get<any[]>(this.api); }
  getMesSujets(): Observable<any[]> { return this.http.get<any[]>(`${this.api}/mes-sujets`); }
  getByStatut(statut: string): Observable<any[]> { return this.http.get<any[]>(`${this.api}/statut/${statut}`); }
  proposer(data: any): Observable<any> { return this.http.post<any>(this.api, data); }
  valider(id: number): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/valider`, {}); }
  refuser(id: number): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/refuser`, {}); }
  affecter(id: number, data: any): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/affecter`, data); }
  supprimer(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }
}
