import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, switchMap, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { OrganisationApi } from '../data-access/organisation-api.abstract';
import { OrganisationActions } from './organisations.actions';
import { organisationsList } from './organisations.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class OrganisationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(OrganisationApi);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, organisationsList, (query) =>
      this.api.list(query),
    ),
  );

  readonly loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationActions.loadDetail),
      switchMap(({ id }) =>
        this.api.get(id).pipe(
          map((organisation) => OrganisationActions.loadDetailSuccess({ organisation })),
          catchError((err) => of(OrganisationActions.loadDetailFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((organisation) => OrganisationActions.createSuccess({ organisation })),
          catchError((err) => of(OrganisationActions.createFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((organisation) => OrganisationActions.updateSuccess({ organisation })),
          catchError((err) => of(OrganisationActions.updateFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationActions.setStatus),
      exhaustMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((organisation) => OrganisationActions.setStatusSuccess({ organisation })),
          catchError((err) => of(OrganisationActions.setStatusFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationActions.resetPassword),
      exhaustMap(({ id }) =>
        this.api.resetPassword(id).pipe(
          map((result) => OrganisationActions.resetPasswordSuccess({ result })),
          catchError((err) =>
            of(OrganisationActions.resetPasswordFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly createNavigation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(OrganisationActions.createSuccess),
        tap(({ organisation }) =>
          void this.router.navigate(['/admin/organisations', organisation.id]),
        ),
      ),
    { dispatch: false },
  );

  readonly reloadListAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrganisationActions.createSuccess,
        OrganisationActions.updateSuccess,
        OrganisationActions.setStatusSuccess,
      ),
      map(() => organisationsList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(OrganisationActions.createSuccess),
          tap(({ organisation }) =>
            this.notifications.success(
              `${organisation.name} enrolled — Partner ID ${organisation.partnerId}`,
              { detail: 'They must change the temporary password on first sign in.' },
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationActions.updateSuccess),
          tap(({ organisation }) =>
            this.notifications.success(`${organisation.name}’s details updated`),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationActions.setStatusSuccess),
          tap(({ organisation }) =>
            this.notifications.success(
              `${organisation.name} ${
                organisation.status === 'ACTIVE' ? 'reactivated' : 'deactivated'
              }`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationActions.resetPasswordSuccess),
          tap(({ result }) =>
            this.notifications.success(
              result.delivery === 'ADMIN_DISPLAY'
                ? 'Temporary password generated'
                : `Temporary password sent to the organisation (${result.delivery.toLowerCase()})`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(
            OrganisationActions.setStatusFailure,
            OrganisationActions.resetPasswordFailure,
          ),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
