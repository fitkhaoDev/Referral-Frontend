import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectPermissions } from '../store/auth.selectors';

/**
 * Requires every permission listed in the route's `data.permissions` on the admin
 * session. Denied navigation is sent to `/admin/forbidden`. The backend RBAC remains
 * authoritative; this only shapes the UI.
 */
@Injectable({ providedIn: 'root' })
export class AdminPermissionGuard implements CanActivate {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const required = (route.data?.['permissions'] as string[] | undefined) ?? [];
    return this.store.select(selectPermissions('admin')).pipe(
      take(1),
      map((perms) =>
        required.every((p) => perms.includes(p))
          ? true
          : this.router.createUrlTree(['/admin/forbidden']),
      ),
    );
  }
}
