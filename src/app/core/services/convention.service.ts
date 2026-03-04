import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConventionService {
  private api = 'http://localhost:8080/api/conventions';

  constructor(private http: HttpClient) {}

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
}