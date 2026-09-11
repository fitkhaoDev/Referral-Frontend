import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { ReferralEventApi } from '../data-access/referral-event-api.abstract';
import { ReferralEventActions } from './referral-events.actions';
import { referralEventsList } from './referral-events.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class ReferralEventsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(ReferralEventApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, referralEventsList, (query) =>
      this.api.list(query),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralEventActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((event) => ReferralEventActions.createSuccess({ event })),
          catchError((err) => of(ReferralEventActions.createFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralEventActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((event) => ReferralEventActions.updateSuccess({ event })),
          catchError((err) => of(ReferralEventActions.updateFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReferralEventActions.setStatus),
      exhaustMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((event) => ReferralEventActions.setStatusSuccess({ event })),
          catchError((err) => of(ReferralEventActions.setStatusFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ReferralEventActions.createSuccess,
        ReferralEventActions.updateSuccess,
        ReferralEventActions.setStatusSuccess,
      ),
      map(() => referralEventsList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(ReferralEventActions.createSuccess),
          tap(({ event }) => this.notifications.success(`Referral event “${event.name}” created`)),
        ),
        this.actions$.pipe(
          ofType(ReferralEventActions.updateSuccess),
          tap(({ event }) => this.notifications.success(`Referral event “${event.name}” updated`)),
        ),
        this.actions$.pipe(
          ofType(ReferralEventActions.setStatusSuccess),
          tap(({ event }) =>
            this.notifications.success(
              `“${event.name}” is now ${event.status === 'ACTIVE' ? 'active' : 'inactive'}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(ReferralEventActions.setStatusFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
