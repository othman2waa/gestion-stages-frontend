import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AppNotification {
  id: number;
  titre: string;
  message: string;
  type: string;
  lue: boolean;
  lien: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;
  private unreadCount$ = new BehaviorSubject<number>(0);

  readonly unreadCount = this.unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.base);
  }

  getNonLues(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.base}/non-lues`);
  }

  refreshCount(): void {
    this.http.get<{ count: number }>(`${this.base}/count`).subscribe({
      next: (r) => this.unreadCount$.next(r.count),
      error: () => {}
    });
  }

  marquerLue(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/lue`, {}).pipe(
      tap(() => {
        const current = this.unreadCount$.value;
        if (current > 0) this.unreadCount$.next(current - 1);
      })
    );
  }

  marquerToutesLues(): Observable<void> {
    return this.http.put<void>(`${this.base}/lire-tout`, {}).pipe(
      tap(() => this.unreadCount$.next(0))
    );
  }
}
