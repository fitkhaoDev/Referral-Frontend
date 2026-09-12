import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, switchMap, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { PartnerTypeApi } from '../data-access/partner-type-api.abstract';
import { PartnerTypeActions } from './partner-types.actions';
import { partnerTypesList } from './partner-types.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class PartnerTypesEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(PartnerTypeApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, partnerTypesList, (query) => this.api.list(query)),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerTypeActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((partnerType) => PartnerTypeActions.createSuccess({ partnerType })),
          catchError((err) => of(PartnerTypeActions.createFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerTypeActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((partnerType) => PartnerTypeActions.updateSuccess({ partnerType })),
          catchError((err) => of(PartnerTypeActions.updateFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PartnerTypeActions.setStatus),
      switchMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((partnerType) => PartnerTypeActions.setStatusSuccess({ partnerType })),
          catchError((err) => of(PartnerTypeActions.setStatusFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  /** Any successful mutation refreshes the current page. */
  readonly reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PartnerTypeActions.createSuccess,
        PartnerTypeActions.updateSuccess,
        PartnerTypeActions.setStatusSuccess,
      ),
      map(() => partnerTypesList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(PartnerTypeActions.createSuccess),
          tap(({ partnerType }) =>
            this.notifications.success(`Partner type “${partnerType.name}” created`),
          ),
        ),
        this.actions$.pipe(
          ofType(PartnerTypeActions.updateSuccess),
          tap(({ partnerType }) =>
            this.notifications.success(`Partner type “${partnerType.name}” updated`),
          ),
        ),
        this.actions$.pipe(
          ofType(PartnerTypeActions.setStatusSuccess),
          tap(({ partnerType }) =>
            this.notifications.success(
              `“${partnerType.name}” is now ${partnerType.status === 'ACTIVE' ? 'active' : 'inactive'}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(PartnerTypeActions.setStatusFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
