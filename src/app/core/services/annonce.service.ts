import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnnonceService {
  private api = 'http://localhost:8080/api/annonces';
  constructor(private http: HttpClient) {}

  getPubliques(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/publiques`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.api, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  toggle(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/toggle`, {});
  }
}