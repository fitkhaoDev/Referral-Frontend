import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { requireSession } from './auth-guard.util';

/** Requires an authenticated `partner` session; redirects to `/partner/login` otherwise. */
@Injectable({ providedIn: 'root' })
export class PartnerAuthGuard implements CanActivate, CanActivateChild {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return requireSession(this.store, this.router, 'partner', state.url);
  }

  canActivateChild(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return requireSession(this.store, this.router, 'partner', state.url);
  }
}
