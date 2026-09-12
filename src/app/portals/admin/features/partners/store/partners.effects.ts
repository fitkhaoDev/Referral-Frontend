import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, switchMap, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { PartnerApi } from '../data-access/partner-api.abstract';
import { PartnerActions } from './partners.actions';
import { partnersList } from './partners.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class PartnersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(PartnerApi);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, partnersList, (query) => this.api.list(query)),
  );

  readonly loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.loadDetail),
      switchMap(({ id }) =>
        this.api.get(id).pipe(
          map((partner) => PartnerActions.loadDetailSuccess({ partner })),
          catchError((err) => of(PartnerActions.loadDetailFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((partner) => PartnerActions.createSuccess({ partner })),
          catchError((err) => of(PartnerActions.createFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((partner) => PartnerActions.updateSuccess({ partner })),
          catchError((err) => of(PartnerActions.updateFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.setStatus),
      switchMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((partner) => PartnerActions.setStatusSuccess({ partner })),
          catchError((err) => of(PartnerActions.setStatusFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerActions.resetPassword),
      exhaustMap(({ id }) =>
        this.api.resetPassword(id).pipe(
          map((result) => PartnerActions.resetPasswordSuccess({ result })),
          catchError((err) => of(PartnerActions.resetPasswordFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  /** After a successful create, go to the new partner's detail page. */
  readonly createNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PartnerActions.createSuccess),
        tap(({ partner }) => void this.router.navigate(['/admin/partners', partner.id])),
      ),
    { dispatch: false },
  );

  /** Keep the list fresh after any mutation. */
  readonly reloadListAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PartnerActions.createSuccess,
        PartnerActions.updateSuccess,
        PartnerActions.setStatusSuccess,
      ),
      map(() => partnersList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(PartnerActions.createSuccess),
          tap(({ partner }) =>
            this.notifications.success(`${partner.name} enrolled — Partner ID ${partner.partnerId}`, {
              detail: 'They must change the temporary password on first sign in.',
            }),
          ),
        ),
        this.actions$.pipe(
          ofType(PartnerActions.updateSuccess),
          tap(({ partner }) => this.notifications.success(`${partner.name}’s details updated`)),
        ),
        this.actions$.pipe(
          ofType(PartnerActions.setStatusSuccess),
          tap(({ partner }) =>
            this.notifications.success(
              `${partner.name} ${partner.status === 'ACTIVE' ? 'reactivated' : 'deactivated'}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(PartnerActions.resetPasswordSuccess),
          tap(({ result }) =>
            this.notifications.success(
              result.delivery === 'ADMIN_DISPLAY'
                ? 'Temporary password generated'
                : `Temporary password sent to the partner (${result.delivery.toLowerCase()})`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(PartnerActions.setStatusFailure, PartnerActions.resetPasswordFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
