import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { isApiError } from '../../models/api-error.util';
import { ApiError } from '../../models/api.model';
import { sessionFromToken } from '../models/auth.model';
import { AuthApi } from '../services/auth-api.abstract';
import { SessionStorageService } from '../services/session-storage.service';
import { AuthActions } from './auth.actions';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'Something went wrong. Please try again.' };
}

@Injectable()
export class AuthEffects {
  // Injected as field initializers (declared BEFORE the createEffect fields).
  // `target: ES2022` gives native class-field semantics, so field initializers run
  // before constructor-body parameter-property assignments would — and NgRx v21's
  // `createEffect` invokes the source factory eagerly, so `this.actions$` must
  // already be set when `login$`'s initializer runs.
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly storage = inject(SessionStorageService);

  readonly login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ audience, request }) =>
        this.api.login(audience, request).pipe(
          map((res) =>
            AuthActions.loginSuccess({ audience, session: sessionFromToken(audience, res) }),
          ),
          catchError((err) => of(AuthActions.loginFailure({ audience, error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.changePassword),
      exhaustMap(({ audience, request }) =>
        this.api.changePassword(audience, request).pipe(
          map((res) =>
            AuthActions.changePasswordSuccess({
              audience,
              session: sessionFromToken(audience, res),
            }),
          ),
          catchError((err) =>
            of(AuthActions.changePasswordFailure({ audience, error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly refreshSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshSession),
      exhaustMap(({ audience }) =>
        this.api.refresh(audience, { refreshToken: 'from-store' }).pipe(
          map((res) =>
            AuthActions.refreshSessionSuccess({
              audience,
              session: sessionFromToken(audience, res),
            }),
          ),
          catchError((err) =>
            of(AuthActions.refreshSessionFailure({ audience, error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  /**
   * Sign-out is purely client-side: no backend call. We simply dispatch
   * sessionCleared, which drops the tokens from storage and redirects to
   * the login screen.
   */
  readonly logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      map(({ audience, reason }) => AuthActions.sessionCleared({ audience, reason })),
    ),
  );

  /** Persist a session to per-audience storage whenever one is issued or renewed. */
  readonly persistSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AuthActions.loginSuccess,
          AuthActions.changePasswordSuccess,
          AuthActions.refreshSessionSuccess,
        ),
        tap(({ session }) => this.storage.write(session)),
      ),
    { dispatch: false },
  );

  /** Route after a successful login: forced password change first, then a safe returnUrl. */
  readonly loginNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ audience, session }) => {
          if (session.mustChangePassword) {
            void this.router.navigate([`/${audience}/change-password`]);
            return;
          }
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] as
            | string
            | undefined;
          const safe =
            returnUrl && returnUrl.startsWith(`/${audience}/`) && !returnUrl.includes('//')
              ? returnUrl
              : `/${audience}`;
          void this.router.navigateByUrl(safe);
        }),
      ),
    { dispatch: false },
  );

  readonly changePasswordNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.changePasswordSuccess),
        tap(({ audience }) => void this.router.navigate([`/${audience}`])),
      ),
    { dispatch: false },
  );

  readonly sessionClearedNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.sessionCleared),
        tap(({ audience }) => {
          this.storage.clear(audience);
          void this.router.navigate([`/${audience}/login`]);
        }),
      ),
    { dispatch: false },
  );
}
