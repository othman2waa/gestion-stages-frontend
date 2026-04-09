import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, { data: HttpResponse<unknown>; time: number }>();
const TTL = 30000; // 30 secondes

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  const skip = ['/auth/', '/reporting/', '/stats'];
  if (skip.some(s => req.url.includes(s))) return next(req);

  const cached = cache.get(req.url);
  if (cached && Date.now() - cached.time < TTL) {
    return of(cached.data.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, { data: event, time: Date.now() });
      }
    })
  );
};
