import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take } from 'rxjs';
import { selectIsAuthenticated } from '../store/auth.selectors';

/** Keeps an already-authenticated admin off `/admin/login`. */
@Injectable({ providedIn: 'root' })
export class AdminGuestGuard implements CanActivate {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectIsAuthenticated('admin')).pipe(
      take(1),
      map((authed) => (authed ? this.router.createUrlTree(['/admin']) : true)),
    );
  }
}
