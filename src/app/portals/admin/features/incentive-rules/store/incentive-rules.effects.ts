import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { IncentiveRuleApi } from '../data-access/incentive-rule-api.abstract';
import { IncentiveRuleActions } from './incentive-rules.actions';
import { incentiveRulesList } from './incentive-rules.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class IncentiveRulesEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(IncentiveRuleApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, incentiveRulesList, (query) =>
      this.api.list(query),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncentiveRuleActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((rule) => IncentiveRuleActions.createSuccess({ rule })),
          catchError((err) => of(IncentiveRuleActions.createFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncentiveRuleActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((rule) => IncentiveRuleActions.updateSuccess({ rule })),
          catchError((err) => of(IncentiveRuleActions.updateFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IncentiveRuleActions.setStatus),
      exhaustMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((rule) => IncentiveRuleActions.setStatusSuccess({ rule })),
          catchError((err) => of(IncentiveRuleActions.setStatusFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        IncentiveRuleActions.createSuccess,
        IncentiveRuleActions.updateSuccess,
        IncentiveRuleActions.setStatusSuccess,
      ),
      map(() => incentiveRulesList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(IncentiveRuleActions.createSuccess),
          tap(({ rule }) => this.notifications.success(`Incentive rule “${rule.name}” created`)),
        ),
        this.actions$.pipe(
          ofType(IncentiveRuleActions.updateSuccess),
          tap(({ rule }) =>
            this.notifications.success(
              `Incentive rule “${rule.name}” updated — now version ${rule.version}. Existing commissions keep their snapshot.`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(IncentiveRuleActions.setStatusSuccess),
          tap(({ rule }) =>
            this.notifications.success(
              `“${rule.name}” is now ${rule.status === 'ACTIVE' ? 'active' : 'inactive'}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(IncentiveRuleActions.setStatusFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
