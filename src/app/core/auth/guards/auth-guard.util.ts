import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { Audience } from '../models/auth.model';
import { selectIsAuthenticated } from '../store/auth.selectors';

/**
 * Shared guard helper: resolve `true` when a session exists for `audience`, otherwise
 * a redirect to that audience's login (preserving `returnUrl` for deep links).
 *
 * Because admin and partner sessions are stored separately, a partner hitting
 * `/admin/**` is simply "not authenticated as admin" and is bounced to
 * `/admin/login`. The backend independently rejects cross-audience tokens.
 */
export function requireSession(
  store: Store,
  router: Router,
  audience: Audience,
  attemptedUrl: string,
): Observable<boolean | UrlTree> {
  return store.select(selectIsAuthenticated(audience)).pipe(
    take(1),
    map((authed) =>
      authed
        ? true
        : router.createUrlTree([`/${audience}/login`], {
            queryParams:
              attemptedUrl && attemptedUrl !== `/${audience}` ? { returnUrl: attemptedUrl } : undefined,
          }),
    ),
  );
}
