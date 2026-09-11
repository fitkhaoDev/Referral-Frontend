import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectIsAuthenticated } from '../store/auth.selectors';

/** Keeps an already-authenticated partner off `/partner/login`. */
@Injectable({ providedIn: 'root' })
export class PartnerGuestGuard implements CanActivate {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated('partner')).pipe(
      take(1),
      map((authed) => (authed ? this.router.createUrlTree(['/partner']) : true)),
    );
  }
}
