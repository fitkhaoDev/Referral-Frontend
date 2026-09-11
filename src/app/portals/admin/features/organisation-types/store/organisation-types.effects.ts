import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { OrganisationTypeApi } from '../data-access/organisation-type-api.abstract';
import { OrganisationTypeActions } from './organisation-types.actions';
import { organisationTypesList } from './organisation-types.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class OrganisationTypesEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(OrganisationTypeApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, organisationTypesList, (query) =>
      this.api.list(query),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationTypeActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((organisationType) => OrganisationTypeActions.createSuccess({ organisationType })),
          catchError((err) =>
            of(OrganisationTypeActions.createFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationTypeActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((organisationType) => OrganisationTypeActions.updateSuccess({ organisationType })),
          catchError((err) =>
            of(OrganisationTypeActions.updateFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationTypeActions.setStatus),
      exhaustMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((organisationType) => OrganisationTypeActions.setStatusSuccess({ organisationType })),
          catchError((err) =>
            of(OrganisationTypeActions.setStatusFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrganisationTypeActions.createSuccess,
        OrganisationTypeActions.updateSuccess,
        OrganisationTypeActions.setStatusSuccess,
      ),
      map(() => organisationTypesList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(OrganisationTypeActions.createSuccess),
          tap(({ organisationType }) =>
            this.notifications.success(`Organisation type “${organisationType.name}” created`),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationTypeActions.updateSuccess),
          tap(({ organisationType }) =>
            this.notifications.success(`Organisation type “${organisationType.name}” updated`),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationTypeActions.setStatusSuccess),
          tap(({ organisationType }) =>
            this.notifications.success(
              `“${organisationType.name}” is now ${
                organisationType.status === 'ACTIVE' ? 'active' : 'inactive'
              }`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationTypeActions.setStatusFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
