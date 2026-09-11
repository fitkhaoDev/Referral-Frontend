import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectMustChangePassword } from '../store/auth.selectors';

/**
 * Blocks every routed partner destination while `mustChangePassword` is true,
 * redirecting to `/partner/change-password`. NOT attached to the change-password
 * route itself. Client-side convenience only — the backend also refuses protected
 * calls until the temporary password is replaced.
 */
@Injectable({ providedIn: 'root' })
export class PartnerPasswordChangeGuard implements CanActivate, CanActivateChild {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  private check(): Observable<boolean | UrlTree> {
    return this.store.select(selectMustChangePassword('partner')).pipe(
      take(1),
      map((must) => (must ? this.router.createUrlTree(['/partner/change-password']) : true)),
    );
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.check();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.check();
  }
}
