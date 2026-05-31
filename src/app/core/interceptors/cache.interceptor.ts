import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, { data: HttpResponse<unknown>; time: number }>();
const TTL = 30000; // 30 secondes

/**
 * Extract the base resource path from a URL.
 * e.g. /api/stages/5 -> /api/stages
 *      /api/stages/5/documents/3 -> /api/stages/5/documents
 *      /api/stages -> /api/stages
 */
function getBaseResourcePath(url: string): string {
  // Remove query params and fragment
  const path = url.split('?')[0].split('#')[0];
  // Split into segments and remove empty ones
  const segments = path.split('/').filter(s => s.length > 0);

  // Walk backwards: drop trailing segment if it looks like an ID (numeric or UUID-like)
  const idPattern = /^(\d+|[0-9a-f-]{36})$/i;
  while (segments.length > 1 && idPattern.test(segments[segments.length - 1])) {
    segments.pop();
  }

  return '/' + segments.join('/');
}

/**
 * Invalidate all cache entries whose path starts with the given base resource path.
 */
function invalidateCache(basePath: string): void {
  for (const key of cache.keys()) {
    const keyPath = key.split('?')[0].split('#')[0];
    if (keyPath.startsWith(basePath)) {
      cache.delete(key);
    }
  }
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (mutationMethods.includes(req.method)) {
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const basePath = getBaseResourcePath(req.url);
          invalidateCache(basePath);
        }
      })
    );
  }

  if (req.method !== 'GET') return next(req);

  const skip = ['/auth/', '/reporting/', '/stats'];
  if (skip.some(s => req.url.includes(s))) return next(req);

  const cacheKey = req.urlWithParams;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < TTL) {
    return of(cached.data.clone());
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(cacheKey, { data: event, time: Date.now() });
      }
    })
  );
};
