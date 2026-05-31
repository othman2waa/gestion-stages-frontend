import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DepartementResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class DepartementService {
  private api = `${environment.apiUrl}/departements`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<DepartementResponse[]> { return this.http.get<DepartementResponse[]>(this.api); }
  getActifs(): Observable<DepartementResponse[]> { return this.http.get<DepartementResponse[]>(`${this.api}/actifs`); }
  getById(id: number): Observable<DepartementResponse> { return this.http.get<DepartementResponse>(`${this.api}/${id}`); }
  create(data: any): Observable<DepartementResponse> { return this.http.post<DepartementResponse>(this.api, data); }
  update(id: number, data: any): Observable<DepartementResponse> { return this.http.put<DepartementResponse>(`${this.api}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
  toggle(id: number): Observable<void> { return this.http.patch<void>(`${this.api}/${id}/toggle`, {}); }
}
